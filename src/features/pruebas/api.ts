import { ErrorApi, peticion, URL_API } from "@/lib/api-client"
import { leerToken } from "@/lib/session"

import type {
  DetallePruebas,
  FiltrosRecorridos,
  PaginaRecorridos,
  ResultadoValidacion,
  ResumenPruebas,
  TesterPruebas,
} from "./types"

/** `?a=1&b=2` sin los valores vacíos. */
function consulta(parametros: Record<string, string | number | undefined>) {
  const busqueda = new URLSearchParams()
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== "") busqueda.set(clave, String(valor))
  }
  const texto = busqueda.toString()
  return texto ? `?${texto}` : ""
}

/** 204 si la sesión es la cuenta de pruebas; 403 (otra cuenta) o 404 (modo apagado) si no. */
export async function tieneAcceso(): Promise<boolean> {
  try {
    await peticion<null>("/pruebas/acceso")
    return true
  } catch (e) {
    if (e instanceof ErrorApi && (e.codigo === 403 || e.codigo === 404)) return false
    throw e
  }
}

export function obtenerResumen(desde?: string, usuarioId?: number) {
  return peticion<ResumenPruebas>(`/pruebas/resumen${consulta({ desde, usuario_id: usuarioId })}`)
}

export function listarRecorridos(filtros: FiltrosRecorridos, pagina: number, limite: number) {
  return peticion<PaginaRecorridos>(`/pruebas/recorridos${consulta({ ...filtros, pagina, limite })}`)
}

export function obtenerDetalle(id: number) {
  return peticion<DetallePruebas>(`/pruebas/recorridos/${id}`)
}

export function listarTesters(desde?: string) {
  return peticion<TesterPruebas[]>(`/pruebas/testers${consulta({ desde })}`)
}

export function marcarEvento(eventoId: number, resultado: ResultadoValidacion) {
  return peticion(`/pruebas/eventos/${eventoId}/validacion`, { metodo: "PUT", cuerpo: { resultado } })
}

export function desmarcarEvento(eventoId: number) {
  return peticion<null>(`/pruebas/eventos/${eventoId}/validacion`, { metodo: "DELETE" })
}

/** Descarga el CSV con los filtros actuales. `peticion` espera JSON: aquí se pide el archivo. */
export async function descargarCsv(filtros: FiltrosRecorridos) {
  let respuesta: Response
  try {
    respuesta = await fetch(`${URL_API}/pruebas/recorridos/exportar${consulta({ ...filtros })}`, {
      headers: { Authorization: `Bearer ${leerToken() ?? ""}` },
    })
  } catch {
    throw new ErrorApi(ErrorApi.SIN_CONEXION)
  }
  if (!respuesta.ok) {
    const datos = (await respuesta.json().catch(() => null)) as { detail?: unknown } | null
    const detalle = typeof datos?.detail === "string" ? datos.detail : ErrorApi.INESPERADO
    throw new ErrorApi(detalle, respuesta.status)
  }
  const url = URL.createObjectURL(await respuesta.blob())
  const enlace = document.createElement("a")
  enlace.href = url
  enlace.download = `viajes-pruebas-${new Date().toISOString().slice(0, 10)}.csv`
  enlace.click()
  URL.revokeObjectURL(url)
}
