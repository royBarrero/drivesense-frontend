import type { DetallePlan } from "./types"

/** "últimos 30 días", "últimos 12 meses" o "completo". */
export function textoHistorial(plan: DetallePlan) {
  if (plan.historial_dias != null) return `últimos ${plan.historial_dias} días`
  if (plan.historial_meses != null) return `últimos ${plan.historial_meses} meses`
  return "completo"
}

export function textoLimite(plan: DetallePlan) {
  return plan.limite_conductores == null ? "Sin tope de conductores" : `Hasta ${plan.limite_conductores} conductores`
}

export function textoPrecio(plan: DetallePlan) {
  return plan.precio_bs === 0 ? "Gratis" : `Bs ${plan.precio_bs}`
}

/** Mismo día del mes siguiente; si no existe, el último día (igual que el backend). */
export function sumarMeses(fecha: Date, meses: number) {
  const resultado = new Date(fecha)
  const dia = resultado.getDate()
  resultado.setDate(1)
  resultado.setMonth(resultado.getMonth() + meses)
  const ultimo = new Date(resultado.getFullYear(), resultado.getMonth() + 1, 0).getDate()
  resultado.setDate(Math.min(dia, ultimo))
  return resultado
}
