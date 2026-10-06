import { formatearDiaMes } from "@/lib/format"

/** Periodos fijos de las pantallas de pruebas. */
export type Periodo = "hoy" | "7d" | "30d" | "todo"

export const PERIODOS: { valor: Periodo; nombre: string }[] = [
  { valor: "hoy", nombre: "Hoy" },
  { valor: "7d", nombre: "Últimos 7 días" },
  { valor: "30d", nombre: "Últimos 30 días" },
  { valor: "todo", nombre: "Todo" },
]

const DIAS_ATRAS: Record<Exclude<Periodo, "todo">, number> = { hoy: 0, "7d": 6, "30d": 29 }

/** Comparación con el periodo anterior de igual duración (la calcula el backend). */
export const FRENTE_A: Record<Exclude<Periodo, "todo">, string> = {
  hoy: "frente a ayer",
  "7d": "frente a los 7 días anteriores",
  "30d": "frente a los 30 días anteriores",
}

export function esPeriodo(valor: string | null): valor is Periodo {
  return PERIODOS.some((p) => p.valor === valor)
}

/** Medianoche local del primer día (hoy incluido), o nada para "Todo". Fijo durante el día. */
export function inicioPeriodo(periodo: Periodo, ahora = new Date()): Date | undefined {
  if (periodo === "todo") return undefined
  const inicio = new Date(ahora)
  inicio.setHours(0, 0, 0, 0)
  inicio.setDate(inicio.getDate() - DIAS_ATRAS[periodo])
  return inicio
}

/** `desde` para la API (ISO con zona). */
export function desdePeriodo(periodo: Periodo) {
  return inicioPeriodo(periodo)?.toISOString()
}

/** "29 sep – 5 oct", "Hoy" o "Todo". */
export function rangoPeriodo(periodo: Periodo, ahora = new Date()) {
  if (periodo === "hoy") return "Hoy"
  const inicio = inicioPeriodo(periodo, ahora)
  if (!inicio) return "Todo"
  return `${formatearDiaMes(inicio)} – ${formatearDiaMes(ahora)}`
}
