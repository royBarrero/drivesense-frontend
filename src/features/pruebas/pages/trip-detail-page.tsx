import { ArrowLeft, CalendarDays, CircleAlert, Info, Loader2, Smartphone } from "lucide-react"
import { Link, useLocation, useParams } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { formatearDia, formatearDuracion, formatearHora, formatearKm, formatearVelocidad } from "@/lib/format"
import { NOMBRE_CALIFICACION, TEXTO_CALIFICACION } from "@/lib/score"
import { cn } from "@/lib/utils"

import { obtenerDetalle } from "../api"
import { DistintivoPuntaje } from "../components/badges"
import { ListaEventos } from "../components/event-list"
import { TarjetaKpi } from "../components/kpi-card"
import { AvatarTester } from "../components/tester-avatar"
import { MapaViaje } from "../components/trip-map"
import { ESTILO_EVENTO, LIMITE_VELOCIDAD_KMH, TIPOS_EVENTO } from "../constants"
import { textoDispositivoCompleto } from "../format"
import type { DetallePruebas } from "../types"
import { useConsulta } from "../use-query"

/** Pruebas · Detalle del viaje (temporal). */
export function DetalleViajePruebasPagina() {
  const { id } = useParams()
  const estado = useLocation().state as { volver?: string } | null
  // "Volver" conserva los filtros con los que se abrió el viaje
  const volver = estado?.volver ?? "/panel/pruebas"
  const detalle = useConsulta(`detalle:${id}`, () => obtenerDetalle(Number(id)))

  return (
    <>
      <title>Detalle del viaje · Pruebas · DriveSense</title>
      <Link to={volver} className="inline-flex items-center gap-2 text-cuerpo font-semibold text-enlace hover:underline">
        <ArrowLeft className="size-5" aria-hidden="true" />
        Volver a viajes
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

function Detalle({ viaje }: { viaje: DetallePruebas }) {
  const dispositivo = textoDispositivoCompleto(viaje)
  const conPuntaje = viaje.drivescore !== null

  return (
    <>
      <section className="mt-6 flex flex-wrap items-center gap-5 rounded-xl border border-border bg-card p-5 shadow-tarjeta">
        <AvatarTester id={viaje.conductor.id} nombre={viaje.conductor.nombre} grande />
        <div className="min-w-0 flex-1">
          <h1 className="text-titulo">{viaje.conductor.nombre}</h1>
          <p className="mt-1 flex flex-wrap gap-x-5 gap-y-1 text-cuerpo text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden="true" />
              {formatearDia(viaje.fecha_inicio)} · {formatearHora(viaje.fecha_inicio)} a {formatearHora(viaje.fecha_fin)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Smartphone className="size-4" aria-hidden="true" />
              {dispositivo ?? viaje.conductor.email}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-cuerpo font-medium text-muted-foreground">DriveScore</span>
          <DistintivoPuntaje
            drivescore={viaje.drivescore}
            calificacion={viaje.calificacion}
            estado={viaje.estado}
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
        <TarjetaKpi
          etiqueta="Velocidad máxima"
          valor={formatearVelocidad(viaje.velocidad_maxima_kmh)}
          detalle={`Límite configurado: ${LIMITE_VELOCIDAD_KMH} km/h`}
        />
        <TarjetaKpi etiqueta="Velocidad promedio" valor={formatearVelocidad(viaje.velocidad_promedio_kmh)} />
      </section>

      {viaje.estado === "descartado" ? (
        <Aviso>
          Viaje descartado: duró menos de 1 minuto o recorrió menos de 200 m. No se guardaron su ruta, sus eventos
          ni su DriveScore.
        </Aviso>
      ) : (
        <div className="mt-5 grid gap-5 xl:grid-cols-[3fr_2fr]">
          <section className="flex flex-col gap-6 rounded-xl border border-border bg-card p-5 shadow-tarjeta">
            <div>
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
            </div>
            {conPuntaje ? (
              <ListaEventos eventos={viaje.eventos ?? []} />
            ) : (
              <p className="text-cuerpo text-muted-foreground">
                Este viaje es anterior al cálculo del DriveScore: no se guardaron sus eventos.
              </p>
            )}
          </section>

          {conPuntaje && (
            <div className="flex flex-col gap-5">
              <Desglose viaje={viaje} />
              <EventosPorTipo conteo={viaje.eventos_por_tipo} />
              <p className="flex gap-3 rounded-xl border border-border bg-muted p-5 text-cuerpo text-muted-foreground">
                <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                Marca cada evento como correcto o falso según lo que el tester cuente del viaje. Sirve para medir qué
                tan bien detecta la app.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function Aviso({ children }: { children: string }) {
  return (
    <p className="mt-5 flex items-start gap-3 rounded-lg border border-advertencia/30 bg-tinte-advertencia px-4 py-3 text-cuerpo font-medium text-texto-evento-giro">
      <CircleAlert className="mt-px size-5 shrink-0" aria-hidden="true" />
      {children}
    </p>
  )
}

/** Mismo orden y colores que la app: la barra de cada categoría en el texto de su evento. */
function Desglose({ viaje }: { viaje: DetallePruebas }) {
  const categorias = [
    { nombre: "Velocidad", puntaje: viaje.puntaje_velocidad, barra: ESTILO_EVENTO.exceso_velocidad.punto },
    { nombre: "Frenadas", puntaje: viaje.puntaje_frenadas, barra: ESTILO_EVENTO.frenada_brusca.punto },
    { nombre: "Aceleraciones", puntaje: viaje.puntaje_aceleraciones, barra: ESTILO_EVENTO.aceleracion_severa.punto },
    { nombre: "Giros", puntaje: viaje.puntaje_giros, barra: ESTILO_EVENTO.giro_agresivo.punto },
  ]
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <h2 className="text-subtitulo-grande">Desglose del DriveScore</h2>
      <ul className="mt-4 flex flex-col gap-4">
        {categorias.map((c) => (
          <li key={c.nombre}>
            <div className="flex justify-between text-cuerpo">
              <span>{c.nombre}</span>
              <span className="font-numeros font-bold tabular-nums">{c.puntaje ?? "—"}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-carril">
              <div className={cn("h-full rounded-full", c.barra)} style={{ width: `${c.puntaje ?? 0}%` }} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function EventosPorTipo({ conteo }: { conteo: DetallePruebas["eventos_por_tipo"] }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <h2 className="text-subtitulo-grande">Eventos por tipo</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {TIPOS_EVENTO.map((tipo) => {
          const estilo = ESTILO_EVENTO[tipo]
          return (
            <div key={tipo} className={cn("rounded-lg p-4", estilo.tinte)}>
              <p className={cn("font-numeros text-puntaje tabular-nums", estilo.texto)}>{conteo?.[tipo] ?? 0}</p>
              <p className={cn("mt-1 text-cuerpo font-medium", estilo.texto)}>{estilo.plural}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
