import { consulta, descargarArchivo, peticion } from "@/lib/api-client"

import type {
  ConductorCreado,
  DatosNuevoConductor,
  DetalleViajeConductor,
  FiltrosConductores,
  MapaEventos,
  OpcionesReporte,
  PaginaConductores,
  PaginaEventos,
  PerfilConductor,
  Periodo,
  ResumenEventos,
  ResumenFlota,
  ViajeConductor,
} from "./types"
import type { TipoEvento } from "@/lib/trip-types"

export function listarConductores(filtros: FiltrosConductores, pagina: number, limite: number) {
  return peticion<PaginaConductores>(`/flotas/conductores${consulta({ ...filtros, pagina, limite })}`)
}

export function obtenerResumen(periodo: Periodo) {
  return peticion<ResumenFlota>(`/flotas/resumen${consulta({ periodo })}`)
}

export function registrarConductor(datos: DatosNuevoConductor) {
  return peticion<ConductorCreado>("/flotas/conductores", { metodo: "POST", cuerpo: datos })
}

export function generarContraseniaTemporal(conductorId: number) {
  return peticion<{ contrasenia_temporal: string }>(`/flotas/conductores/${conductorId}/contrasenia-temporal`, {
    metodo: "POST",
  })
}

export function obtenerPerfil(conductorId: number, periodo: Periodo) {
  return peticion<PerfilConductor>(`/flotas/conductores/${conductorId}${consulta({ periodo })}`)
}

export function listarViajesRecientes(conductorId: number, periodo: Periodo) {
  return peticion<ViajeConductor[]>(`/flotas/conductores/${conductorId}/recorridos${consulta({ periodo })}`)
}

export function obtenerDetalleViaje(conductorId: number, viajeId: number) {
  return peticion<DetalleViajeConductor>(`/flotas/conductores/${conductorId}/recorridos/${viajeId}`)
}

export function listarEventos(
  conductorId: number,
  periodo: Periodo,
  tipo: TipoEvento | undefined,
  pagina: number,
  limite: number,
) {
  return peticion<PaginaEventos>(
    `/flotas/conductores/${conductorId}/eventos${consulta({ periodo, tipo, pagina, limite })}`,
  )
}

export function obtenerResumenEventos(conductorId: number, periodo: Periodo) {
  return peticion<ResumenEventos>(`/flotas/conductores/${conductorId}/eventos/resumen${consulta({ periodo })}`)
}

/** Descarga el reporte de desempeño de un conductor (HU-27). 409 si no hay viajes en el periodo. */
export function exportarReporteConductor(conductorId: number, opciones: OpcionesReporte) {
  return descargarArchivo(
    `/flotas/conductores/${conductorId}/reporte${consulta({ ...opciones })}`,
    `reporte-conductor.${opciones.formato}`,
  )
}

/** Descarga el reporte de desempeño de toda la flota (HU-27). */
export function exportarReporteFlota(opciones: OpcionesReporte) {
  return descargarArchivo(`/flotas/reporte${consulta({ ...opciones })}`, `reporte-flota.${opciones.formato}`)
}

export function obtenerMapaEventos(conductorId: number, periodo: Periodo, tipo: TipoEvento | undefined) {
  return peticion<MapaEventos>(`/flotas/conductores/${conductorId}/eventos/mapa${consulta({ periodo, tipo })}`)
}
