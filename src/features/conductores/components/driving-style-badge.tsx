import { cn } from "@/lib/utils"

import { ESTILO_CONDUCCION } from "../driving-style"
import type { EstiloConduccion } from "../types"

/** Estilo de conducción (HU-25) con el color de su riesgo; `pequeno` para tablas. */
export function DistintivoEstilo({
  estilo,
  pequeno = false,
  className,
}: {
  estilo: EstiloConduccion
  pequeno?: boolean
  className?: string
}) {
  const visual = ESTILO_CONDUCCION[estilo]
  const Icono = visual.icono
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap",
        pequeno ? "px-2.5 py-0.5 text-cuerpo-pequeno" : "px-3 py-1 text-cuerpo",
        visual.clase,
        className,
      )}
    >
      <Icono className="size-4 shrink-0" aria-hidden="true" />
      {estilo === "sin_datos" && pequeno ? "Sin datos" : visual.nombre}
    </span>
  )
}
