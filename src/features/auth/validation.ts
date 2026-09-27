import { z } from "zod"

// Mismas reglas que el backend y la app móvil (register_validation.dart)
const LETRA = /[A-Za-z]/ // como el backend: las letras con tilde no cuentan
const NUMERO = /\d/
const TELEFONO = /^\d{8}$/

/** Correo normalizado: sin espacios y en minúsculas, igual que al enviarlo. */
const correo = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Ingresa un correo válido" }))

const telefono = z.string().regex(TELEFONO, { error: "El teléfono debe tener 8 dígitos" })

/** Error de la contraseña cuando no cumple los requisitos (la lista ya lo muestra). */
export const MENSAJE_REQUISITOS = "La contraseña no cumple los requisitos"

export function requisitosContrasenia(contrasenia: string) {
  const largo = contrasenia.length >= 8
  const letra = LETRA.test(contrasenia)
  const numero = NUMERO.test(contrasenia)
  return { largo, letra, numero, cumple: largo && letra && numero }
}

// --- Inicio de sesión ---

export const esquemaLogin = z.object({
  email: correo,
  // Sin reglas de complejidad: en el login solo se compara con el hash
  contrasenia: z.string().min(1, { error: "Ingresa tu contraseña" }).max(128),
})

export type DatosLogin = z.input<typeof esquemaLogin>

// --- Registro de empresa ---
// Misma forma que el cuerpo de la API, para que los `campo` de un 422
// (`empresa.telefono`, `administrador.email`) coincidan con los del formulario.

export const esquemaRegistroEmpresa = z.object({
  empresa: z.object({
    nombre: z
      .string()
      .trim()
      .min(1, { error: "Ingresa el nombre de la empresa" })
      .max(150, { error: "Debe tener como máximo 150 caracteres" }),
    tipo: z.enum(["flota", "aseguradora"], { error: "Elige el tipo de empresa" }),
    email_contacto: correo,
    telefono,
  }),
  administrador: z
    .object({
      nombre: z
        .string()
        .trim()
        .min(1, { error: "Ingresa tu nombre" })
        .max(100, { error: "Debe tener como máximo 100 caracteres" }),
      email: correo,
      telefono,
      contrasenia: z
        .string()
        .max(128, { error: "Debe tener como máximo 128 caracteres" })
        .refine((valor) => requisitosContrasenia(valor).cumple, {
          error: MENSAJE_REQUISITOS,
        }),
      confirmacion: z.string().min(1, { error: "Confirma tu contraseña" }),
    })
    .refine((a) => a.confirmacion === a.contrasenia, {
      error: "Las contraseñas no coinciden",
      path: ["confirmacion"],
      // Se comprueba aunque otros campos del administrador sean inválidos
      when: ({ value }) => {
        const a = value as { contrasenia?: unknown; confirmacion?: unknown }
        return typeof a.contrasenia === "string" && typeof a.confirmacion === "string" && a.confirmacion !== ""
      },
    }),
})

export type DatosFormularioRegistro = z.input<typeof esquemaRegistroEmpresa>
export type DatosRegistroValidados = z.output<typeof esquemaRegistroEmpresa>
