import { peticion } from "@/lib/api-client"

import type { DetallePlan, IdPlan, PlanActual } from "./types"

export function obtenerPlan() {
  return peticion<PlanActual>("/suscripciones/plan")
}

export function listarPlanes() {
  return peticion<DetallePlan[]>("/suscripciones/planes")
}

/** Cambio de plan con pago simulado: no hay cobro real. */
export function cambiarPlan(plan: IdPlan) {
  return peticion<PlanActual>("/suscripciones/plan", { metodo: "POST", cuerpo: { plan } })
}
