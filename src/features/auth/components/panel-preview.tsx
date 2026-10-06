import { iniciales } from "@/lib/format"
import { CLASE_CALIFICACION, calificar } from "@/lib/score"
import { cn } from "@/lib/utils"

// Datos ilustrativos fijos: no vienen de la API
const CONDUCTORES = [
  { nombre: "María Quispe", resumen: "18 viajes · 1 frenada brusca", puntaje: 94 },
  { nombre: "Jorge Mamani", resumen: "12 viajes · 4 aceleraciones severas", puntaje: 81 },
  { nombre: "Lucía Rojas", resumen: "9 viajes · 7 excesos de velocidad", puntaje: 63 },
]

export function VistaPreviaPanel() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-tarjeta sm:p-6">
      <p className="text-subtitulo">
        Vista previa del panel <span className="text-muted-foreground">· Conductores</span>
      </p>
      <ul className="mt-4 divide-y divide-border">
        {CONDUCTORES.map((c) => (
          <li key={c.nombre} className="flex items-center gap-3 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-tinte-nav-activo text-cuerpo-pequeno font-semibold text-enlace">
              {iniciales(c.nombre)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-cuerpo font-semibold">{c.nombre}</span>
              <span className="block truncate text-cuerpo-pequeno text-muted-foreground">{c.resumen}</span>
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 font-numeros text-numero-metrica font-bold tabular-nums",
                CLASE_CALIFICACION[calificar(c.puntaje)],
              )}
            >
              {c.puntaje}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
