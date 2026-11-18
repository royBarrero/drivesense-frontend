import { cn } from "@/lib/utils"

import type { NivelRiesgo } from "../types"

const ESTILO: Record<NivelRiesgo, { texto: string; clase: string }> = {
  alto: { texto: "Riesgo alto", clase: "bg-tinte-peligro text-destructive" },
  medio: { texto: "Riesgo medio", clase: "bg-tinte-advertencia text-texto-evento-giro" },
  bajo: { texto: "Riesgo bajo", clase: "bg-tinte-primario text-texto-exito" },
}

/** Nivel de riesgo del conductor: riesgoso = alto, regular = medio, muy bueno y excelente = bajo. */
export function DistintivoRiesgo({ nivel, className }: { nivel: NivelRiesgo; className?: string }) {
  const estilo = ESTILO[nivel]
  return (
    <span
      className={cn("inline-flex rounded-full px-3 py-1 text-cuerpo font-semibold", estilo.clase, className)}
    >
      {estilo.texto}
    </span>
  )
}
