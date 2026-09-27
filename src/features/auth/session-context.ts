import { createContext, useContext } from "react"

import type { DatosRegistroEmpresa, UsuarioAdmin } from "./types"

export type EstadoSesion = "comprobando" | "autenticado" | "sinSesion" | "error"

export interface ValorSesion {
  estado: EstadoSesion
  usuario: UsuarioAdmin | null
  /** Mensaje cuando no se pudo comprobar la sesión (p. ej. sin conexión). */
  error: string | null
  /** Lanzan `ErrorApi` si fallan; la pantalla muestra su mensaje. */
  iniciarSesion: (email: string, contrasenia: string) => Promise<void>
  registrarEmpresa: (datos: DatosRegistroEmpresa) => Promise<void>
  cerrarSesion: () => void
  reintentar: () => void
}

export const ContextoSesion = createContext<ValorSesion | null>(null)

export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion)
  if (!valor) throw new Error("useSesion debe usarse dentro de SesionProvider")
  return valor
}
