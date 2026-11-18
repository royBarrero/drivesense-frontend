import { CLASE_CALIFICACION, type Calificacion } from "@/lib/score"
import { cn } from "@/lib/utils"

/** DriveScore con el color de su calificación; "—" si todavía no hay (docs/diseno.md, 6.5). */
export function DistintivoPuntaje({
  drivescore,
  calificacion,
  className,
}: {
  drivescore: number | null
  calificacion: Calificacion | null
  className?: string
}) {
  if (drivescore === null || calificacion === null) {
    return <span className="font-numeros text-numero-metrica text-texto-terciario">—</span>
  }
  return (
    <span
      className={cn(
        "inline-flex min-w-12 justify-center rounded-full px-3 py-1 font-numeros text-numero-metrica font-bold tabular-nums",
        CLASE_CALIFICACION[calificacion],
        className,
      )}
    >
      {drivescore}
    </span>
  )
}
