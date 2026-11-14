import { DistintivoPuntaje as DistintivoGenerico } from "@/components/score-badge"
import type { Calificacion } from "@/lib/score"
import { cn } from "@/lib/utils"

import { ESTILO_EVENTO } from "../constants"
import type { EstadoRecorrido, TipoEvento } from "../types"

/** DriveScore de un viaje: un descartado lo dice en lugar del número. */
export function DistintivoPuntaje({
  estado = "finalizado",
  ...props
}: {
  drivescore: number | null
  calificacion: Calificacion | null
  estado?: EstadoRecorrido
  className?: string
}) {
  if (estado === "descartado") {
    return (
      <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-etiqueta font-semibold text-muted-foreground">
        Descartado
      </span>
    )
  }
  return <DistintivoGenerico {...props} />
}

/** Cantidad de eventos de un tipo: con su tinte si hubo, gris en 0 y "—" si no se sabe. */
export function ConteoEvento({ tipo, cantidad }: { tipo: TipoEvento; cantidad: number | null }) {
  if (cantidad === null) return <span className="font-numeros text-cuerpo text-texto-terciario">—</span>
  if (cantidad === 0) return <span className="font-numeros text-cuerpo text-texto-terciario tabular-nums">0</span>
  const estilo = ESTILO_EVENTO[tipo]
  return (
    <span
      className={cn(
        "inline-flex w-12 justify-center rounded-full py-1 font-numeros text-cuerpo font-bold tabular-nums",
        estilo.tinte,
        estilo.texto,
      )}
    >
      {cantidad}
    </span>
  )
}
