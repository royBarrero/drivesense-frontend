import { consulta, peticion } from "@/lib/api-client"

import type {
  ConductorCreado,
  DatosNuevoConductor,
  FiltrosConductores,
  PaginaConductores,
  Periodo,
  ResumenFlota,
} from "./types"

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
