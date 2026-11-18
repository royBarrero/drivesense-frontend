import { Link } from "react-router"

import { usePlan } from "../plan-context"
import { textoHistorial } from "../format"

/** Recuerda la ventana de historial del plan; no se muestra con historial completo. */
export function NotaHistorial() {
  const { plan } = usePlan()
  if (!plan || (plan.detalle.historial_dias == null && plan.detalle.historial_meses == null)) return null
  return (
    <p className="mt-3 text-cuerpo-pequeno text-muted-foreground">
      Tu plan {plan.detalle.nombre} muestra el historial de los {textoHistorial(plan.detalle)}.{" "}
      <Link to="/panel/plan" className="font-semibold text-enlace hover:underline">
        Ver planes
      </Link>
    </p>
  )
}
