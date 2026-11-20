import { Lightbulb } from "lucide-react"

import { CapsulaIA } from "@/components/ai-badge"

export interface Recomendacion {
  titulo: string
  texto: string
  generada_por_ia: boolean
}

/** Recomendación principal y secundarias del viaje, con la cápsula "Con IA" si la IA redactó alguna. */
export function RecomendacionesViaje({ recomendaciones }: { recomendaciones: Recomendacion[] }) {
  if (recomendaciones.length === 0) return null
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-subtitulo-grande">
          <Lightbulb className="size-5 text-texto-evento-giro" aria-hidden="true" />
          Recomendaciones del viaje
        </h2>
        {recomendaciones.some((r) => r.generada_por_ia) && (
          <CapsulaIA titulo="Redactadas por IA con los datos de este viaje" />
        )}
      </div>
      <ul className="mt-4 flex flex-col gap-4">
        {recomendaciones.map((r) => (
          <li key={r.titulo}>
            <p className="text-subtitulo">{r.titulo}</p>
            <p className="mt-1 text-cuerpo text-muted-foreground">{r.texto}</p>
          </li>
        ))}
      </ul>
    </section>
  )
}
