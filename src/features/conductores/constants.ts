import type { Orden, Periodo } from "./types"

export const CONDUCTORES_POR_PAGINA = 20

export const PERIODOS: { valor: Periodo; nombre: string }[] = [
  { valor: "7d", nombre: "Últimos 7 días" },
  { valor: "30d", nombre: "Últimos 30 días" },
  { valor: "todo", nombre: "Todo" },
]

export const ORDENES: { valor: Orden; nombre: string }[] = [
  { valor: "ultimo_viaje", nombre: "Último viaje" },
  { valor: "drivescore", nombre: "DriveScore" },
  { valor: "viajes", nombre: "Viajes" },
]

export const PERIODO_INICIAL: Periodo = "30d"
export const ORDEN_INICIAL: Orden = "ultimo_viaje"

export function esPeriodo(valor: string | null): valor is Periodo {
  return PERIODOS.some((p) => p.valor === valor)
}

export function esOrden(valor: string | null): valor is Orden {
  return ORDENES.some((o) => o.valor === valor)
}
