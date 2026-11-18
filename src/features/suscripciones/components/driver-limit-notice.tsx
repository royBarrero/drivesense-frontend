import { Users } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"

import { limiteDeConductoresAlcanzado, usePlan } from "../plan-context"

/** Aviso en Conductores al llegar al tope del plan: sugiere mejorarlo. */
export function AvisoLimiteConductores() {
  const { plan } = usePlan()
  if (!plan || !limiteDeConductoresAlcanzado(plan)) return null
  return (
    <div
      role="status"
      className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-advertencia/40 bg-tinte-advertencia p-4 text-texto-evento-giro"
    >
      <Users className="size-5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1 text-cuerpo">
        Llegaste al límite de {plan.detalle.limite_conductores} conductores de tu plan {plan.detalle.nombre}. Mejora
        tu plan para registrar más.
      </p>
      <Button asChild size="sm">
        <Link to="/panel/plan">Mejorar plan</Link>
      </Button>
    </div>
  )
}
