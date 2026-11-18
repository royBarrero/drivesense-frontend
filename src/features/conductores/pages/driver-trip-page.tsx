import { ArrowLeft, CalendarDays, CircleAlert, Lightbulb, Loader2, Sparkles } from "lucide-react"
import { Link, useLocation, useParams } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { EventosPorTipo } from "@/components/event-counts"
import { TarjetaKpi } from "@/components/kpi-card"
import { DistintivoPuntaje } from "@/components/score-badge"
import { Desglose } from "@/components/score-breakdown"
import { MapaViaje } from "@/components/trip-map"
import { useConsulta } from "@/hooks/use-consulta"
import { ESTILO_EVENTO, TIPOS_EVENTO } from "@/lib/events"
import { formatearDia, formatearDuracion, formatearHora, formatearKm, formatearVelocidad } from "@/lib/format"
import { NOMBRE_CALIFICACION, TEXTO_CALIFICACION } from "@/lib/score"
import { cn } from "@/lib/utils"

import { obtenerDetalleViaje } from "../api"
import type { DetalleViajeConductor } from "../types"

/** Detalle de un viaje de un conductor de la flota: mapa, desglose y eventos por tipo. */
export function DetalleViajeConductorPagina() {
  const { id, viajeId } = useParams()
  const estado = useLocation().state as { volver?: string } | null
  // "Volver" conserva el periodo con el que se abrió el perfil
  const volver = estado?.volver ?? `/panel/conductores/${id}`
  const detalle = useConsulta(`detalle:${id}:${viajeId}`, () => obtenerDetalleViaje(Number(id), Number(viajeId)))

  return (
    <>
      <title>Detalle del viaje · DriveSense</title>
      <Link to={volver} className="inline-flex items-center gap-2 text-cuerpo font-semibold text-enlace hover:underline">
        <ArrowLeft className="size-5" aria-hidden="true" />
        Volver al perfil
      </Link>

      {detalle.error && (
        <div className="mt-6">
          <AvisoError mensaje={detalle.error} />
        </div>
      )}
      {detalle.cargando && !detalle.datos && (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" aria-label="Cargando el viaje" />
        </div>
      )}
      {detalle.datos && <Detalle viaje={detalle.datos} />}
    </>
  )
}

function Detalle({ viaje }: { viaje: DetalleViajeConductor }) {
  const conPuntaje = viaje.drivescore !== null

  return (
    <>
      <section className="mt-6 flex flex-wrap items-center gap-5 rounded-xl border border-border bg-card p-5 shadow-tarjeta">
        <div className="min-w-0 flex-1">
          <h1 className="text-titulo">Viaje del {formatearDia(viaje.fecha_inicio)}</h1>
          <p className="mt-1 inline-flex items-center gap-1.5 text-cuerpo text-muted-foreground">
            <CalendarDays className="size-4" aria-hidden="true" />
            {formatearHora(viaje.fecha_inicio)} a {formatearHora(viaje.fecha_fin)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-cuerpo font-medium text-muted-foreground">DriveScore</span>
          <DistintivoPuntaje
            drivescore={viaje.drivescore}
            calificacion={viaje.calificacion}
            className="px-4 py-2 text-puntaje"
          />
          {viaje.calificacion && (
            <span className={cn("text-subtitulo", TEXTO_CALIFICACION[viaje.calificacion])}>
              {NOMBRE_CALIFICACION[viaje.calificacion]}
            </span>
          )}
        </div>
      </section>

      <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Métricas del viaje">
        <TarjetaKpi etiqueta="Distancia" valor={formatearKm(viaje.distancia_m)} />
        <TarjetaKpi etiqueta="Duración" valor={formatearDuracion(viaje.duracion_s)} />
        <TarjetaKpi etiqueta="Velocidad máxima" valor={formatearVelocidad(viaje.velocidad_maxima_kmh)} />
        <TarjetaKpi etiqueta="Velocidad promedio" valor={formatearVelocidad(viaje.velocidad_promedio_kmh)} />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[3fr_2fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-subtitulo-grande">Ruta y eventos</h2>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-cuerpo-pequeno text-muted-foreground">
              {TIPOS_EVENTO.map((tipo) => (
                <li key={tipo} className="inline-flex items-center gap-1.5">
                  <span className={cn("size-2.5 rounded-full", ESTILO_EVENTO[tipo].punto)} aria-hidden="true" />
                  {ESTILO_EVENTO[tipo].corto}
                </li>
              ))}
            </ul>
          </div>
          <MapaViaje ruta={viaje.ruta ?? []} eventos={viaje.eventos ?? []} />
        </section>

        <div className="flex flex-col gap-5">
          {conPuntaje ? (
            <>
              <Desglose
                puntajes={{
                  velocidad: viaje.puntaje_velocidad,
                  frenadas: viaje.puntaje_frenadas,
                  aceleraciones: viaje.puntaje_aceleraciones,
                  giros: viaje.puntaje_giros,
                }}
              />
              <EventosPorTipo conteo={viaje.eventos_por_tipo} />
              {viaje.recomendacion && (
                <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="flex items-center gap-2 text-subtitulo-grande">
                      <Lightbulb className="size-5 text-texto-evento-giro" aria-hidden="true" />
                      Recomendaciones del viaje
                    </h2>
                    {[viaje.recomendacion, ...viaje.recomendaciones_secundarias].some((r) => r.generada_por_ia) && (
                      <span
                        className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-tinte-confort px-3 text-etiqueta-grande text-texto-evento-aceleracion uppercase"
                        title="Redactadas por IA con los datos de este viaje"
                      >
                        <Sparkles className="size-4" aria-hidden="true" />
                        Con IA
                      </span>
                    )}
                  </div>
                  <ul className="mt-4 flex flex-col gap-4">
                    {[viaje.recomendacion, ...viaje.recomendaciones_secundarias].map((r) => (
                      <li key={r.titulo}>
                        <p className="text-subtitulo">{r.titulo}</p>
                        <p className="mt-1 text-cuerpo text-muted-foreground">{r.texto}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <p className="flex items-start gap-3 rounded-lg border border-advertencia/30 bg-tinte-advertencia px-4 py-3 text-cuerpo font-medium text-texto-evento-giro">
              <CircleAlert className="mt-px size-5 shrink-0" aria-hidden="true" />
              Este viaje es anterior al cálculo del DriveScore: no se guardaron sus eventos.
            </p>
          )}
        </div>
      </div>
    </>
  )
}
