import { consulta, descargarArchivo, ErrorApi, peticion } from "@/lib/api-client"

import type {
  DetallePruebas,
  FiltrosRecorridos,
  PaginaRecorridos,
  RecorridoSimulado,
  ResultadoValidacion,
  ResumenPruebas,
  TesterPruebas,
} from "./types"

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

/** Descarga el CSV con los filtros actuales. */
export function descargarCsv(filtros: FiltrosRecorridos) {
  return descargarArchivo(
    `/pruebas/recorridos/exportar${consulta({ ...filtros })}`,
    `viajes-pruebas-${new Date().toISOString().slice(0, 10)}.csv`,
  )
}

/** Simulador de demo: guarda el viaje a nombre del conductor, como si lo enviara su teléfono. */
export function crearRecorridoSimulado(conductorId: number, cuerpo: unknown) {
  return peticion<RecorridoSimulado>(`/pruebas/conductores/${conductorId}/recorridos-simulados`, {
    metodo: "POST",
    cuerpo,
  })
}

/** Borra todos los viajes simulados del conductor; devuelve cuántos. */
export function borrarRecorridosSimulados(conductorId: number) {
  return peticion<{ borrados: number }>(`/pruebas/conductores/${conductorId}/recorridos-simulados`, {
    metodo: "DELETE",
  })
}
