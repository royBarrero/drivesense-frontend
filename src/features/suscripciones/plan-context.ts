import { createContext, useContext } from "react"

import type { FuncionPlan, PlanActual } from "./types"

export interface ValorPlan {
  /** Nulo mientras carga (o si falló: ver `error`). */
  plan: PlanActual | null
  error: string | null
  recargar: () => void
}

export const ContextoPlan = createContext<ValorPlan>({ plan: null, error: null, recargar: () => {} })

/** Plan de la empresa. Dentro de `/panel` siempre hay un proveedor. */
export function usePlan() {
  return useContext(ContextoPlan)
}

/** `true` si el plan incluye la función; `null` mientras no se conoce el plan. */
export function incluye(plan: PlanActual | null, funcion: FuncionPlan) {
  return plan ? plan.detalle.funciones[funcion] : null
}

/**
 * Periodos que el plan no deja elegir: con un historial limitado en días (Gratis) "Todo el
 * tiempo" queda bloqueado, porque el backend solo devuelve esa ventana.
 */
export function periodosBloqueados(plan: PlanActual | null): readonly string[] {
  return plan?.detalle.historial_dias != null ? ["todo"] : []
}

/** El plan llegó a su tope de conductores (nunca con "sin tope"). */
export function limiteDeConductoresAlcanzado(plan: PlanActual | null) {
  const limite = plan?.detalle.limite_conductores
  return plan != null && limite != null && plan.conductores_usados >= limite
}
