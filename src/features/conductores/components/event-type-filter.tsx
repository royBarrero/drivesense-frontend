import { ESTILO_EVENTO, TIPOS_EVENTO } from "@/lib/events"
import { formatearEntero } from "@/lib/format"
import type { TipoEvento } from "@/lib/trip-types"
import { cn } from "@/lib/utils"

const CLASE_CHIP =
  "inline-flex h-12 items-center gap-2 rounded-full border px-4 text-cuerpo font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50"

/** Filtro por tipo de evento: "Todos" y un chip por tipo, cada uno con su cantidad del periodo. */
export function FiltroTipoEvento({
  valor,
  total,
  conteo,
  alCambiar,
}: {
  /** Tipo elegido; nulo = todos. */
  valor: TipoEvento | null
  total: number | null
  conteo: Record<TipoEvento, number> | null
  alCambiar: (tipo: TipoEvento | null) => void
}) {
  return (
    <div role="group" aria-label="Tipo de evento" className="flex flex-wrap gap-3">
      <button
        type="button"
        aria-pressed={valor === null}
        onClick={() => alCambiar(null)}
        className={cn(
          CLASE_CHIP,
          valor === null
            ? "border-transparent bg-encabezado-fondo text-encabezado-texto"
            : "border-border bg-card text-foreground hover:bg-muted",
        )}
      >
        Todos
        <span className={cn("font-numeros tabular-nums", valor === null ? "text-encabezado-acento" : "text-texto-exito")}>
          {total === null ? "—" : formatearEntero(total)}
        </span>
      </button>
      {TIPOS_EVENTO.map((tipo) => {
        const estilo = ESTILO_EVENTO[tipo]
        const Icono = estilo.icono
        const cantidad = conteo?.[tipo] ?? 0
        const activo = valor === tipo
        return (
          <button
            key={tipo}
            type="button"
            aria-pressed={activo}
            onClick={() => alCambiar(activo ? null : tipo)}
            className={cn(
              CLASE_CHIP,
              "pl-2",
              activo
                ? "border-transparent bg-encabezado-fondo text-encabezado-texto"
                : "border-border bg-card text-foreground hover:bg-muted",
              !activo && cantidad === 0 && "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "flex size-8 items-center justify-center rounded-full",
                estilo.tinte,
                estilo.texto,
                cantidad === 0 && !activo && "opacity-60",
              )}
            >
              <Icono className="size-4" aria-hidden="true" />
            </span>
            {estilo.plural}
            <span
              className={cn(
                "font-numeros tabular-nums",
                activo ? "text-encabezado-acento" : "text-muted-foreground",
              )}
            >
              {conteo ? formatearEntero(cantidad) : "—"}
            </span>
          </button>
        )
      })}
    </div>
  )
}
