import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

interface Props {
  etiqueta: string
  valor: ReactNode
  detalle?: ReactNode
  icono?: LucideIcon
  /** Tinte y color del ícono, p. ej. "bg-tinte-primario text-texto-exito". */
  claseIcono?: string
  cargando?: boolean
}

/** Tarjeta de KPI (docs/diseno.md, 6.3). */
export function TarjetaKpi({ etiqueta, valor, detalle, icono: Icono, claseIcono, cargando = false }: Props) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <div className="flex items-start justify-between gap-3">
        <p className="text-cuerpo font-medium text-muted-foreground">{etiqueta}</p>
        {Icono && (
          <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", claseIcono)}>
            <Icono className="size-5" aria-hidden="true" />
          </span>
        )}
      </div>
      <p className={cn("font-numeros text-puntaje tabular-nums", cargando && "text-texto-terciario")}>{valor}</p>
      {detalle && <p className="text-cuerpo-pequeno text-muted-foreground">{detalle}</p>}
    </div>
  )
}
