import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { useSesion } from "@/features/auth/session-context"
import { ErrorApi } from "@/lib/api-client"

interface Resultado<T> {
  clave: string
  datos: T | null
  error: string | null
}

/**
 * Carga datos de la API cada vez que cambia `clave` (los parámetros de la consulta).
 * Mientras carga conserva los datos anteriores, para no parpadear al paginar o filtrar.
 * Un 401 cierra la sesión.
 */
export function useConsulta<T>(clave: string, cargar: () => Promise<T>) {
  const { cerrarSesion } = useSesion()
  const [version, setVersion] = useState(0)
  const claveActual = `${clave}#${version}`
  const [resultado, setResultado] = useState<Resultado<T> | null>(null)

  const cargarRef = useRef(cargar)
  useLayoutEffect(() => {
    cargarRef.current = cargar
  })

  useEffect(() => {
    let vigente = true
    cargarRef
      .current()
      .then((datos) => {
        if (vigente) setResultado({ clave: claveActual, datos, error: null })
      })
      .catch((e: unknown) => {
        if (!vigente) return
        if (e instanceof ErrorApi && e.codigo === 401) {
          cerrarSesion()
          return
        }
        const mensaje = e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO
        setResultado((anterior) => ({ clave: claveActual, datos: anterior?.datos ?? null, error: mensaje }))
      })
    return () => {
      vigente = false
    }
  }, [claveActual, cerrarSesion])

  const recargar = useCallback(() => setVersion((v) => v + 1), [])
  const cargando = resultado?.clave !== claveActual

  return {
    datos: resultado?.datos ?? null,
    error: cargando ? null : (resultado?.error ?? null),
    cargando,
    recargar,
  }
}
