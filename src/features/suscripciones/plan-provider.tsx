import { useMemo, type ReactNode } from "react"

import { useConsulta } from "@/hooks/use-consulta"

import { obtenerPlan } from "./api"
import { ContextoPlan } from "./plan-context"

/** Consulta el plan de la empresa una vez para todo el panel; `recargar` lo refresca. */
export function PlanProvider({ children }: { children: ReactNode }) {
  const consulta = useConsulta("plan", obtenerPlan)
  const { datos, error, recargar } = consulta
  const valor = useMemo(() => ({ plan: datos, error, recargar }), [datos, error, recargar])
  return <ContextoPlan.Provider value={valor}>{children}</ContextoPlan.Provider>
}
