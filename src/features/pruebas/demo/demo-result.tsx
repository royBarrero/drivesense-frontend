import { CircleAlert, RotateCcw } from "lucide-react"

import { EventosPorTipo } from "@/components/event-counts"
import { TarjetaKpi } from "@/components/kpi-card"
import { AnilloDriveScore } from "@/components/score-ring"
import { Desglose } from "@/components/score-breakdown"
import { RecomendacionesViaje } from "@/components/trip-recommendations"
import { Button } from "@/components/ui/button"
import { TIPOS_EVENTO } from "@/lib/events"
import { formatearDuracion, formatearKm, formatearVelocidad } from "@/lib/format"
import { calificar, NOMBRE_CALIFICACION, TEXTO_CALIFICACION } from "@/lib/score"
import type { TipoEvento } from "@/lib/trip-types"
import { cn } from "@/lib/utils"

import type { RecorridoSimulado } from "../types"
import type { EventoDetectado } from "./detector"

/** Resumen del viaje guardado: DriveScore, desglose, eventos y recomendaciones del backend. */
export function ResultadoDemo({
  viaje,
  eventos,
  conductor,
  alNuevoViaje,
}: {
  viaje: RecorridoSimulado
  eventos: EventoDetectado[]
  conductor: string
  alNuevoViaje: () => void
}) {
  const conteo = Object.fromEntries(
    TIPOS_EVENTO.map((tipo) => [tipo, eventos.filter((e) => e.tipo === tipo).length]),
  ) as Record<TipoEvento, number>
  const calificacion = viaje.drivescore === null ? null : calificar(viaje.drivescore)

  return (
    <section className="mt-6 flex flex-col gap-5" aria-label="Resultado del viaje">
      <div className="flex flex-wrap items-center gap-6 rounded-xl border border-border bg-card p-5 shadow-tarjeta">
        <AnilloDriveScore drivescore={viaje.drivescore} etiqueta="DriveScore" />
        <div className="min-w-0 flex-1">
          <p className="text-etiqueta-grande text-texto-evento-giro uppercase">
            {viaje.estado === "finalizado" ? "Viaje simulado guardado" : "Viaje simulado descartado"}
          </p>
          <h2 className="mt-1 text-titulo">{conductor}</h2>
          {calificacion && (
            <p className={cn("mt-1 text-subtitulo-grande", TEXTO_CALIFICACION[calificacion])}>
              {NOMBRE_CALIFICACION[calificacion]}
            </p>
          )}
          {viaje.estado === "finalizado" && (
            <p className="mt-2 text-cuerpo text-muted-foreground">
              Ya aparece en su historial y en su DriveScore, con la etiqueta "Simulado".
            </p>
          )}
        </div>
        <Button variant="outline" onClick={alNuevoViaje}>
          <RotateCcw aria-hidden="true" />
          Nuevo viaje
        </Button>
      </div>

      {viaje.estado === "descartado" && (
        <p className="flex items-start gap-3 rounded-lg border border-advertencia/30 bg-tinte-advertencia px-4 py-3 text-cuerpo font-medium text-texto-evento-giro">
          <CircleAlert className="mt-px size-5 shrink-0" aria-hidden="true" />
          El viaje quedó descartado, como en la app: dura menos de 1 minuto o recorre menos de 200 m. No tiene
          DriveScore ni cuenta en el historial.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <TarjetaKpi etiqueta="Distancia" valor={formatearKm(viaje.distancia_m)} />
        <TarjetaKpi etiqueta="Duración" valor={formatearDuracion(viaje.duracion_s)} />
        <TarjetaKpi etiqueta="Velocidad máxima" valor={formatearVelocidad(viaje.velocidad_maxima_kmh)} />
        <TarjetaKpi etiqueta="Velocidad promedio" valor={formatearVelocidad(viaje.velocidad_promedio_kmh)} />
      </div>

      {viaje.drivescore !== null && (
        <div className="grid gap-5 xl:grid-cols-2">
          <div className="flex flex-col gap-5">
            <Desglose
              puntajes={{
                velocidad: viaje.puntaje_velocidad,
                frenadas: viaje.puntaje_frenadas,
                aceleraciones: viaje.puntaje_aceleraciones,
                giros: viaje.puntaje_giros,
              }}
            />
            <EventosPorTipo conteo={conteo} />
          </div>
          {viaje.recomendacion && (
            <RecomendacionesViaje recomendaciones={[viaje.recomendacion, ...viaje.recomendaciones_secundarias]} />
          )}
        </div>
      )}
    </section>
  )
}
