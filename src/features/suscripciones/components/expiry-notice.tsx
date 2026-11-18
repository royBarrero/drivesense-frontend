import { Clock } from "lucide-react"
import { Link } from "react-router"

import { formatearFechaCompleta } from "@/lib/format"

import { usePlan } from "../plan-context"

/** Aviso en todo el panel cuando el plan de pago está por vencer. */
export function AvisoVencimiento() {
  const { plan } = usePlan()
  if (!plan?.aviso_vencimiento || !plan.fecha_vencimiento || plan.dias_restantes == null) return null
  const dias = plan.dias_restantes
  return (
    <div
      role="status"
      className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-advertencia/40 bg-tinte-advertencia p-3 text-cuerpo-pequeno text-texto-evento-giro"
    >
      <Clock className="size-5 shrink-0" aria-hidden="true" />
      <p className="min-w-0 flex-1">
        Tu plan {plan.detalle.nombre} vence el {formatearFechaCompleta(plan.fecha_vencimiento)} (
        {dias === 1 ? "queda 1 día" : `quedan ${dias} días`}). Al vencer, la empresa pasa al plan Gratis.
      </p>
      <Link to="/panel/plan" className="font-semibold underline-offset-4 hover:underline">
        Renovar
      </Link>
    </div>
  )
}
