import { peticion } from "@/lib/api-client"

import type { DatosRegistroEmpresa, Sesion, UsuarioAdmin } from "./types"

/** Login del panel (solo administradores). */
export function iniciarSesionAdmin(email: string, contrasenia: string) {
  return peticion<Sesion>("/auth/empresa/login", {
    metodo: "POST",
    cuerpo: { email, contrasenia },
  })
}

/** Crea la empresa y su administrador en una sola transacción. */
export function registrarEmpresa(datos: DatosRegistroEmpresa) {
  return peticion<Sesion>("/auth/empresa/registro", { metodo: "POST", cuerpo: datos })
}

export function obtenerUsuarioActual() {
  return peticion<UsuarioAdmin>("/auth/yo")
}
