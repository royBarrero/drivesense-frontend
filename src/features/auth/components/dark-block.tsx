import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface Props {
  children: ReactNode
  /** Ilustración decorativa: se recorta en su propia capa para que el contenido
   *  (la tarjeta de acceso) pueda sobresalir por debajo del bloque. */
  ilustracion?: ReactNode
  className?: string
}

/** Bloque oscuro superior de la landing y del registro (docs/diseno.md, 8.1). */
export function BloqueOscuro({ children, ilustracion, className }: Props) {
  return (
    <section className={cn("relative rounded-b-4xl bg-encabezado-fondo", className)}>
      {ilustracion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-b-4xl">
          {ilustracion}
        </div>
      )}
      <div className="relative">{children}</div>
    </section>
  )
}
