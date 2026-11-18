import { TIPOS_EVENTO } from "@/lib/events"
import type { TipoEvento } from "@/lib/trip-types"

import type { FranjaHoraria, Orden, Periodo, Vista } from "./types"

export const CONDUCTORES_POR_PAGINA = 20

/** `nombre` para el listado y los textos; `etiqueta` para los botones de periodo. */
export const PERIODOS: { valor: Periodo; nombre: string; etiqueta: string }[] = [
  { valor: "7d", nombre: "Últimos 7 días", etiqueta: "7 días" },
  { valor: "30d", nombre: "Últimos 30 días", etiqueta: "30 días" },
  { valor: "todo", nombre: "Todo", etiqueta: "Todo el tiempo" },
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

export const EVENTOS_POR_PAGINA = 10

export const VISTAS: { valor: Vista; etiqueta: string }[] = [
  { valor: "resumen", etiqueta: "Resumen" },
  { valor: "eventos", etiqueta: "Eventos de riesgo" },
]

export function esVista(valor: string | null): valor is Vista {
  return VISTAS.some((v) => v.valor === valor)
}

export function esTipoEvento(valor: string | null): valor is TipoEvento {
  return TIPOS_EVENTO.some((t) => t === valor)
}

/** Lunes a domingo, como `por_dia` del backend (1 = lunes). */
export const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
export const DIAS_SEMANA_CORTO = ["L", "M", "M", "J", "V", "S", "D"]

export const FRANJAS: { valor: FranjaHoraria; nombre: string; horas: string }[] = [
  { valor: "manana", nombre: "Mañana", horas: "06:00 a 11:59" },
  { valor: "tarde", nombre: "Tarde", horas: "12:00 a 18:59" },
  { valor: "noche", nombre: "Noche", horas: "19:00 a 05:59" },
]
