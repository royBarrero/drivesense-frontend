import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"

import { ErrorApi } from "@/lib/api-client"
import { borrarToken, guardarToken, leerToken } from "@/lib/session"

import * as api from "./api"
import { ContextoSesion, type EstadoSesion, type ValorSesion } from "./session-context"
import type { DatosRegistroEmpresa, Sesion, UsuarioAdmin } from "./types"

interface Estado {
  estado: EstadoSesion
  usuario: UsuarioAdmin | null
  error: string | null
}

/**
 * Sesión del administrador. Con un token guardado lo valida con `GET /auth/yo`:
 * 200 → sesión válida; 401 → se borra el token; otro error → se conserva el token
 * y se ofrece reintentar.
 */
export function SesionProvider({ children }: { children: ReactNode }) {
  const [estado, setEstado] = useState<Estado>(() => ({
    estado: leerToken() ? "comprobando" : "sinSesion",
    usuario: null,
    error: null,
  }))

  useEffect(() => {
    if (estado.estado !== "comprobando") return
    let vigente = true
    api
      .obtenerUsuarioActual()
      .then((usuario) => {
        if (vigente) setEstado({ estado: "autenticado", usuario, error: null })
      })
      .catch((e: unknown) => {
        if (!vigente) return
        if (e instanceof ErrorApi && e.codigo === 401) {
          borrarToken()
          setEstado({ estado: "sinSesion", usuario: null, error: null })
        } else {
          const mensaje = e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO
          setEstado({ estado: "error", usuario: null, error: mensaje })
        }
      })
    return () => {
      vigente = false
    }
  }, [estado.estado])

  const abrirSesion = useCallback((sesion: Sesion) => {
    guardarToken(sesion.access_token)
    setEstado({ estado: "autenticado", usuario: sesion.usuario, error: null })
  }, [])

  const iniciarSesion = useCallback(
    async (email: string, contrasenia: string) => {
      abrirSesion(await api.iniciarSesionAdmin(email, contrasenia))
    },
    [abrirSesion],
  )

  const registrarEmpresa = useCallback(
    async (datos: DatosRegistroEmpresa) => {
      abrirSesion(await api.registrarEmpresa(datos))
    },
    [abrirSesion],
  )

  const cerrarSesion = useCallback(() => {
    borrarToken()
    setEstado({ estado: "sinSesion", usuario: null, error: null })
  }, [])

  const reintentar = useCallback(() => {
    setEstado({ estado: "comprobando", usuario: null, error: null })
  }, [])

  const valor = useMemo<ValorSesion>(
    () => ({ ...estado, iniciarSesion, registrarEmpresa, cerrarSesion, reintentar }),
    [estado, iniciarSesion, registrarEmpresa, cerrarSesion, reintentar],
  )

  return <ContextoSesion value={valor}>{children}</ContextoSesion>
}
