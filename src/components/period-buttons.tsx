import { Lock } from "lucide-react"

import { cn } from "@/lib/utils"

interface Opcion<T extends string> {
  valor: T
  etiqueta: string
}

/**
 * Selector de periodo con botones (7 días, 30 días, todo el tiempo…): una cápsula con
 * el botón activo resaltado, igual que las pestañas del panel (docs/diseno.md).
 */
export function BotonesPeriodo<T extends string>({
  opciones,
  valor,
  alCambiar,
  nombre = "Periodo",
  bloqueadas = [],
  className,
}: {
  opciones: readonly Opcion<T>[]
  valor: T
  alCambiar: (valor: T) => void
  /** Nombre accesible del grupo. */
  nombre?: string
  /** Opciones que el plan no incluye: se ven con candado y no se pueden elegir. */
  bloqueadas?: readonly string[]
  className?: string
}) {
  return (
    <div role="group" aria-label={nombre} className={cn("flex w-fit max-w-full rounded-full bg-carril p-1", className)}>
      {opciones.map((opcion) => {
        const activa = opcion.valor === valor
        const bloqueada = bloqueadas.includes(opcion.valor)
        return (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={activa}
            disabled={bloqueada}
            title={bloqueada ? "No está incluido en tu plan" : undefined}
            onClick={() => alCambiar(opcion.valor)}
            className={cn(
              "h-10 rounded-full px-4 text-cuerpo font-semibold whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 sm:px-5",
              activa ? "bg-card text-foreground shadow-tarjeta" : "text-muted-foreground hover:text-foreground",
              bloqueada && "cursor-not-allowed text-texto-terciario hover:text-texto-terciario",
            )}
          >
            {bloqueada && <Lock className="mr-1.5 inline size-4 align-text-bottom" aria-hidden="true" />}
            {opcion.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
