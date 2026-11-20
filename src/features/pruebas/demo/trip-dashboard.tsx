import { ChevronDown, ChevronUp, Flag } from "lucide-react"

import { detalleEvento } from "@/lib/event-format"
import { ESTILO_EVENTO, TIPOS_EVENTO } from "@/lib/events"
import { formatearDecimal } from "@/lib/format"
import type { TipoEvento } from "@/lib/trip-types"
import { cn } from "@/lib/utils"

import type { EventoDetectado } from "./detector"
import type { EstadoSimulador } from "./simulator"

/** Nombres de los botones de evento (como los pidió la demo). */
const BOTON_EVENTO: Record<TipoEvento, string> = {
  aceleracion_severa: "Aceleración brusca",
  frenada_brusca: "Frenada brusca",
  giro_agresivo: "Giro brusco",
  exceso_velocidad: "Exceso de velocidad",
}

/** Orden de los botones: en el que suele mostrarse la demo. */
const ORDEN_BOTONES: TipoEvento[] = ["aceleracion_severa", "frenada_brusca", "giro_agresivo", "exceso_velocidad"]

/** "2:05". */
function formatearCronometro(segundos: number) {
  const total = Math.floor(segundos)
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

/** Evento del simulador con la forma que espera `detalleEvento`. */
function comoEventoViaje(e: EventoDetectado) {
  return {
    tipo: e.tipo,
    fecha: "",
    lat: e.lat,
    lon: e.lon,
    velocidad_kmh: e.velocidadPreviaMs * 3.6,
    intensidad: e.intensidad,
    duracion_s: e.duracionS ?? null,
    velocidad_maxima_kmh: e.velocidadMaximaMs === undefined ? null : e.velocidadMaximaMs * 3.6,
  }
}

/** Velocidad, cifras, controles, botones de evento y eventos detectados en vivo. */
export function TableroViaje({
  estado,
  enCurso,
  acelerar,
  frenar,
  forzar,
  motivoNoDisponible,
}: {
  estado: EstadoSimulador | null
  enCurso: boolean
  acelerar: (activo: boolean) => void
  frenar: (activo: boolean) => void
  forzar: (tipo: TipoEvento) => void
  motivoNoDisponible: (tipo: TipoEvento) => string | null
}) {
  const conteo = Object.fromEntries(
    TIPOS_EVENTO.map((tipo) => [tipo, estado?.eventos.filter((e) => e.tipo === tipo).length ?? 0]),
  ) as Record<TipoEvento, number>
  const sobreLimite = (estado?.velocidadKmh ?? 0) > 60

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta" aria-label="Tablero">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-cuerpo font-medium text-muted-foreground">Velocidad</p>
            <p
              className={cn(
                "font-numeros text-telemetria-xl tabular-nums",
                sobreLimite ? "text-texto-evento-velocidad" : "text-foreground",
              )}
              aria-live="off"
            >
              {Math.round(estado?.velocidadKmh ?? 0)}
              <span className="ml-1 text-subtitulo text-muted-foreground">km/h</span>
            </p>
          </div>
          {estado?.llego && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-tinte-primario px-3 py-1 text-cuerpo-pequeno font-semibold text-texto-exito">
              <Flag className="size-4" aria-hidden="true" />
              Llegaste al destino
            </span>
          )}
        </div>
        <dl className="mt-4 grid grid-cols-3 gap-3">
          <Cifra etiqueta="Aceleración" valor={`${formatearDecimal(estado?.aceleracionMs2 ?? 0)} m/s²`} />
          <Cifra etiqueta="Tiempo" valor={formatearCronometro(estado?.t ?? 0)} />
          <Cifra etiqueta="Distancia" valor={`${formatearDecimal((estado?.distanciaM ?? 0) / 1000, 2)} km`} />
        </dl>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <BotonMantener etiqueta="Acelerar" tecla="↑" icono={ChevronUp} activo={enCurso} alCambiar={acelerar} />
          <BotonMantener etiqueta="Frenar" tecla="↓" icono={ChevronDown} activo={enCurso} alCambiar={frenar} />
        </div>
        <p className="mt-2 text-cuerpo-pequeno text-muted-foreground">
          Mantén apretada la flecha arriba para acelerar y la flecha abajo para frenar. Al soltarlas el auto pierde
          velocidad solo, y reduce antes de las curvas cerradas.
        </p>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
        <h2 className="text-subtitulo-grande">Forzar un evento</h2>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {ORDEN_BOTONES.map((tipo) => {
            const estilo = ESTILO_EVENTO[tipo]
            const Icono = estilo.icono
            const motivo = enCurso ? motivoNoDisponible(tipo) : "Inicia el viaje"
            const enMarcha = estado?.maniobra === tipo
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => forzar(tipo)}
                disabled={motivo !== null}
                className={cn(
                  "flex min-h-16 flex-col items-start gap-1 rounded-lg border border-transparent p-3 text-left transition-opacity focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50",
                  estilo.tinte,
                  enMarcha && "border-current",
                  estilo.texto,
                )}
              >
                <span className="inline-flex items-center gap-2 text-subtitulo">
                  <Icono className="size-5" aria-hidden="true" />
                  {BOTON_EVENTO[tipo]}
                </span>
                {(enMarcha || motivo) && (
                  <span className="text-cuerpo-pequeno">{enMarcha ? "En curso…" : motivo}</span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-subtitulo-grande">Eventos detectados</h2>
          <ul className="flex gap-3 text-cuerpo-pequeno text-muted-foreground">
            {TIPOS_EVENTO.map((tipo) => (
              <li key={tipo} className="inline-flex items-center gap-1.5" title={ESTILO_EVENTO[tipo].plural}>
                <span className={cn("size-2.5 rounded-full", ESTILO_EVENTO[tipo].punto)} aria-hidden="true" />
                <span className="font-numeros tabular-nums">{conteo[tipo]}</span>
              </li>
            ))}
          </ul>
        </div>
        {estado && estado.eventos.length > 0 ? (
          <ul className="mt-4 flex max-h-72 flex-col gap-2 overflow-y-auto" aria-live="polite">
            {[...estado.eventos].reverse().map((e) => {
              const estilo = ESTILO_EVENTO[e.tipo]
              const Icono = estilo.icono
              return (
                <li key={`${e.tipo}-${e.t}`} className="flex items-center gap-3 rounded-lg bg-muted p-3">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md", estilo.tinte)}>
                    <Icono className={cn("size-5", estilo.texto)} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-subtitulo">
                      {estilo.nombre}
                      {e.enCurso && <span className="ml-2 text-cuerpo-pequeno text-muted-foreground">en curso</span>}
                    </span>
                    <span className="block text-cuerpo-pequeno text-muted-foreground">
                      {detalleEvento(comoEventoViaje(e))}
                    </span>
                  </span>
                  <span className="font-numeros text-cuerpo-pequeno tabular-nums text-muted-foreground">
                    {formatearCronometro(e.t)}
                  </span>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-center text-cuerpo text-muted-foreground">
            Todavía no hay eventos. Se detectan con los mismos umbrales de la app.
          </p>
        )}
      </section>
    </div>
  )
}

function Cifra({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <dt className="text-cuerpo-pequeno text-muted-foreground">{etiqueta}</dt>
      <dd className="mt-1 font-numeros text-subtitulo-grande tabular-nums">{valor}</dd>
    </div>
  )
}

/** Botón que actúa mientras se mantiene apretado (alternativa a las flechas). */
function BotonMantener({
  etiqueta,
  tecla,
  icono: Icono,
  activo,
  alCambiar,
}: {
  etiqueta: string
  tecla: string
  icono: typeof ChevronUp
  activo: boolean
  alCambiar: (apretado: boolean) => void
}) {
  return (
    <button
      type="button"
      disabled={!activo}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId)
        alCambiar(true)
      }}
      onPointerUp={() => alCambiar(false)}
      onPointerCancel={() => alCambiar(false)}
      onLostPointerCapture={() => alCambiar(false)}
      className="flex h-12 touch-none items-center justify-center gap-2 rounded-full border border-border bg-card text-cuerpo font-semibold select-none hover:bg-muted active:bg-carril disabled:opacity-50"
    >
      <Icono className="size-5" aria-hidden="true" />
      {etiqueta}
      <kbd className="rounded-sm border border-border bg-muted px-1.5 font-numeros text-cuerpo-pequeno">{tecla}</kbd>
    </button>
  )
}
