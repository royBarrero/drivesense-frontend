import { NOMBRE_CALIFICACION, type Calificacion } from "@/lib/score"
import { cn } from "@/lib/utils"

import type { ConteoCalificaciones } from "../types"

const CALIFICACIONES: { valor: Calificacion; relleno: string }[] = [
  { valor: "excelente", relleno: "bg-primario" },
  { valor: "muy_bueno", relleno: "bg-secundario" },
  { valor: "regular", relleno: "bg-advertencia" },
  { valor: "riesgoso", relleno: "bg-peligro" },
]

/** Cuántos conductores hay en cada calificación del DriveScore del periodo. */
export function DistribucionCalificacion({ conteo }: { conteo: ConteoCalificaciones }) {
  const mayor = Math.max(...CALIFICACIONES.map((c) => conteo[c.valor]), 1)

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <h2 className="text-subtitulo-grande">Conductores por calificación</h2>
      <p className="mt-1 text-cuerpo text-muted-foreground">Según el DriveScore del periodo.</p>
      <ul className="mt-4 flex flex-col gap-4">
        {CALIFICACIONES.map(({ valor, relleno }) => {
          const cantidad = conteo[valor]
          return (
            <li key={valor} className="grid grid-cols-[7rem_1fr_2rem] items-center gap-3">
              <span className="text-cuerpo font-medium">{NOMBRE_CALIFICACION[valor]}</span>
              <span
                className="h-3 overflow-hidden rounded-full bg-carril"
                role="img"
                aria-label={`${NOMBRE_CALIFICACION[valor]}: ${cantidad} ${cantidad === 1 ? "conductor" : "conductores"}`}
              >
                <span
                  className={cn("block h-full rounded-full", relleno)}
                  style={{ width: cantidad > 0 ? `${Math.max((cantidad / mayor) * 100, 4)}%` : "0%" }}
                />
              </span>
              <span className="text-right font-numeros text-numero-metrica tabular-nums">{cantidad}</span>
            </li>
          )
        })}
      </ul>
      {conteo.sin_viajes > 0 && (
        <p className="mt-4 text-ayuda text-muted-foreground">
          {conteo.sin_viajes} {conteo.sin_viajes === 1 ? "conductor" : "conductores"} sin viajes en el periodo.
        </p>
      )}
    </section>
  )
}
