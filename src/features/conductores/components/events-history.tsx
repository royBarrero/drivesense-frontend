import { ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { detalleEvento } from "@/lib/event-format"
import { ESTILO_EVENTO } from "@/lib/events"
import { formatearDiaLargo, formatearEntero } from "@/lib/format"
import { cn } from "@/lib/utils"

import type { EventoConductor } from "../types"

/** Eventos seguidos que comparten día (ya viene en la zona de la empresa). */
function agruparPorDia(eventos: EventoConductor[]) {
  const grupos: { dia: string; eventos: EventoConductor[] }[] = []
  for (const evento of eventos) {
    const ultimo = grupos[grupos.length - 1]
    if (ultimo?.dia === evento.dia) ultimo.eventos.push(evento)
    else grupos.push({ dia: evento.dia, eventos: [evento] })
  }
  return grupos
}

/** Historial de eventos agrupado por día, del más reciente al más antiguo, con paginación. */
export function HistorialEventos({
  eventos,
  total,
  pagina,
  porPagina,
  cargando,
  vacio,
  alElegir,
  alCambiarPagina,
}: {
  eventos: EventoConductor[]
  total: number
  pagina: number
  porPagina: number
  cargando: boolean
  /** Texto cuando la página no tiene eventos. */
  vacio: string
  alElegir: (evento: EventoConductor) => void
  alCambiarPagina: (pagina: number) => void
}) {
  const primero = (pagina - 1) * porPagina + 1
  const ultimo = primero - 1 + eventos.length

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-subtitulo-grande">Historial</h2>
        <p className="text-cuerpo text-muted-foreground">Del más reciente al más antiguo</p>
      </div>

      <div className={cn("mt-4", cargando && "opacity-60 transition-opacity")}>
        {eventos.length === 0 ? (
          <p className="py-10 text-center text-cuerpo text-muted-foreground">{vacio}</p>
        ) : (
          agruparPorDia(eventos).map((grupo) => (
            <div key={grupo.dia} className="mt-5 first:mt-0">
              <h3 className="pb-2 text-etiqueta font-medium tracking-wide text-muted-foreground uppercase">
                {formatearDiaLargo(grupo.dia)}
              </h3>
              <ul className="divide-y divide-border border-t border-border">
                {grupo.eventos.map((evento) => (
                  <li key={evento.id}>
                    <FilaEvento evento={evento} alElegir={alElegir} />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-cuerpo text-muted-foreground">
          {total > 0 ? `Mostrando ${formatearEntero(ultimo - primero + 1)} de ${formatearEntero(total)} eventos` : " "}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => alCambiarPagina(pagina - 1)}>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled={ultimo >= total} onClick={() => alCambiarPagina(pagina + 1)}>
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  )
}

function FilaEvento({ evento, alElegir }: { evento: EventoConductor; alElegir: (evento: EventoConductor) => void }) {
  const estilo = ESTILO_EVENTO[evento.tipo]
  const Icono = estilo.icono
  return (
    <button
      type="button"
      onClick={() => alElegir(evento)}
      className="flex w-full items-center gap-4 rounded-lg px-1 py-3 text-left outline-none hover:bg-muted focus-visible:bg-muted"
    >
      <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-lg", estilo.tinte, estilo.texto)}>
        <Icono className="size-6" aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-subtitulo">{estilo.nombre}</span>
        <span className="block truncate text-cuerpo text-muted-foreground">{detalleEvento(evento)}</span>
      </span>
      <span className="font-numeros text-numero-metrica tabular-nums">{evento.hora}</span>
      <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="sr-only">Ver el viaje donde ocurrió</span>
    </button>
  )
}
