import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

/** Cápsula "Con IA" (docs/diseno.md, 8.9): lo calculó o lo redactó la IA del backend. */
export function CapsulaIA({ titulo, className }: { titulo: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex min-h-7 items-center gap-1.5 rounded-full bg-tinte-confort px-3 text-etiqueta-grande text-texto-evento-aceleracion uppercase",
        className,
      )}
      title={titulo}
    >
      <Sparkles className="size-4" aria-hidden="true" />
      Con IA
    </span>
  )
}
