import { z } from "zod"

import { correo, telefono } from "@/features/auth/validation"

// Misma forma que el cuerpo de la API: los `campo` de un 422 coinciden con los del formulario
export const esquemaNuevoConductor = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, { error: "Ingresa el nombre del conductor" })
    .max(100, { error: "Debe tener como máximo 100 caracteres" }),
  email: correo,
  telefono,
})

export type DatosFormularioConductor = z.input<typeof esquemaNuevoConductor>
export type DatosConductorValidados = z.output<typeof esquemaNuevoConductor>
