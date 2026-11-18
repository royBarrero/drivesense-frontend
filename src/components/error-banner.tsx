import { CircleAlert } from "lucide-react"
import { Link } from "react-router"

/**
 * Aviso de error arriba de un formulario (docs/diseno.md, 6.2). Con `mejorarPlan` (el error
 * lo causó el plan de la empresa) añade la invitación a mejorarlo.
 */
export function AvisoError({ mensaje, mejorarPlan = false }: { mensaje: string; mejorarPlan?: boolean }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-borde-peligro-suave bg-tinte-peligro p-3 text-cuerpo-pequeno text-destructive"
    >
      <CircleAlert className="mt-px size-5 shrink-0" aria-hidden="true" />
      <p>
        {mensaje}
        {mejorarPlan && (
          <>
            {". "}
            <Link to="/panel/plan" className="font-semibold underline underline-offset-4">
              Mejora tu plan
            </Link>{" "}
            para continuar.
          </>
        )}
      </p>
    </div>
  )
}
