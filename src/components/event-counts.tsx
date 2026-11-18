import { ESTILO_EVENTO, TIPOS_EVENTO } from "@/lib/events"
import type { TipoEvento } from "@/lib/trip-types"
import { cn } from "@/lib/utils"

/** Cantidad de eventos de cada tipo, con el tinte de su tipo. */
export function EventosPorTipo({
  conteo,
  titulo = "Eventos por tipo",
  detalle,
}: {
  conteo: Record<TipoEvento, number> | null
  titulo?: string
  /** Texto bajo el título (p. ej. los eventos por 10 km). */
  detalle?: string
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <h2 className="text-subtitulo-grande">{titulo}</h2>
      {detalle && <p className="mt-1 text-cuerpo text-muted-foreground">{detalle}</p>}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {TIPOS_EVENTO.map((tipo) => {
          const estilo = ESTILO_EVENTO[tipo]
          return (
            <div key={tipo} className={cn("rounded-lg p-4", estilo.tinte)}>
              <p className={cn("font-numeros text-puntaje tabular-nums", estilo.texto)}>{conteo?.[tipo] ?? 0}</p>
              <p className={cn("mt-1 text-cuerpo font-medium", estilo.texto)}>{estilo.plural}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
