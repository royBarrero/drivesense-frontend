import { ESTILO_EVENTO } from "@/lib/events"
import { cn } from "@/lib/utils"

export interface PuntajesCategoria {
  velocidad: number | null
  frenadas: number | null
  aceleraciones: number | null
  giros: number | null
}

/** Mismo orden y colores que la app: la barra de cada categoría en el texto de su evento. */
export function Desglose({
  puntajes,
  titulo = "Desglose del DriveScore",
  destacada,
}: {
  puntajes: PuntajesCategoria
  titulo?: string
  /** Categoría a marcar como punto más débil. */
  destacada?: keyof PuntajesCategoria | null
}) {
  const categorias: { clave: keyof PuntajesCategoria; nombre: string; barra: string }[] = [
    { clave: "velocidad", nombre: "Velocidad", barra: ESTILO_EVENTO.exceso_velocidad.punto },
    { clave: "frenadas", nombre: "Frenadas", barra: ESTILO_EVENTO.frenada_brusca.punto },
    { clave: "aceleraciones", nombre: "Aceleraciones", barra: ESTILO_EVENTO.aceleracion_severa.punto },
    { clave: "giros", nombre: "Giros", barra: ESTILO_EVENTO.giro_agresivo.punto },
  ]
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <h2 className="text-subtitulo-grande">{titulo}</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {categorias.map((c) => {
          const puntaje = puntajes[c.clave]
          return (
            <li key={c.clave}>
              <div className="flex items-center justify-between gap-3 text-cuerpo">
                <span className="flex flex-wrap items-center gap-2">
                  {c.nombre}
                  {destacada === c.clave && (
                    <span className="rounded-full bg-tinte-peligro px-2 py-0.5 text-etiqueta font-semibold text-destructive">
                      Punto más débil
                    </span>
                  )}
                </span>
                <span className="font-numeros font-bold tabular-nums">{puntaje ?? "—"}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-carril">
                <div className={cn("h-full rounded-full", c.barra)} style={{ width: `${puntaje ?? 0}%` }} />
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
