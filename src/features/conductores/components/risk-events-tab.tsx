import { Check } from "lucide-react"
import { useLocation, useNavigate } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { BotonesPeriodo } from "@/components/period-buttons"
import { Button } from "@/components/ui/button"
import { FuncionBloqueada } from "@/features/suscripciones/components/locked-feature"
import { incluye, periodosBloqueados, usePlan } from "@/features/suscripciones/plan-context"
import { useConsulta } from "@/hooks/use-consulta"
import { ESTILO_EVENTO, TIPOS_EVENTO } from "@/lib/events"
import { primerNombre } from "@/lib/format"
import type { TipoEvento } from "@/lib/trip-types"
import { cn } from "@/lib/utils"

import { listarEventos, obtenerMapaEventos, obtenerResumenEventos } from "../api"
import { EVENTOS_POR_PAGINA, PERIODOS } from "../constants"
import type { Periodo } from "../types"
import { FiltroTipoEvento } from "./event-type-filter"
import { HistorialEventos } from "./events-history"
import { MapaEventosConductor } from "./events-map"
import { ResumenPatrones } from "./patterns-summary"

const CUANDO: Record<Periodo, string> = {
  "7d": "en los últimos 7 días",
  "30d": "en los últimos 30 días",
  todo: "hasta ahora",
}

/**
 * Pestaña "Eventos de riesgo" del perfil (HU-26): filtros por tipo y periodo, patrones, mapa
 * con todos los eventos e historial por día. Los patrones y los contadores usan siempre todos
 * los tipos; el filtro de tipo solo cambia el historial y el mapa.
 */
export function PestaniaEventos({
  conductorId,
  nombre,
  periodo,
  tipo,
  pagina,
  alCambiar,
}: {
  conductorId: number
  nombre: string
  periodo: Periodo
  /** Tipo elegido; nulo = todos. */
  tipo: TipoEvento | null
  pagina: number
  /** Cambia parámetros de la URL (periodo, tipo, página). */
  alCambiar: (cambios: Record<string, string | undefined>) => void
}) {
  const navegar = useNavigate()
  const { pathname, search } = useLocation()
  const tipoConsulta = tipo ?? undefined
  const { plan, error: errorPlan } = usePlan()
  // Sin el plan que lo incluye no se piden ni el mapa ni los patrones (el backend responde 403)
  const completo = incluye(plan, "eventos_mapa_patrones")

  const resumen = useConsulta(`ev-resumen:${conductorId}:${periodo}:${completo}`, () =>
    completo ? obtenerResumenEventos(conductorId, periodo) : Promise.resolve(null),
  )
  const lista = useConsulta(`ev-lista:${conductorId}:${periodo}:${tipo}:${pagina}`, () =>
    listarEventos(conductorId, periodo, tipoConsulta, pagina, EVENTOS_POR_PAGINA),
  )
  const mapa = useConsulta(`ev-mapa:${conductorId}:${periodo}:${tipo}:${completo}`, () =>
    completo ? obtenerMapaEventos(conductorId, periodo, tipoConsulta) : Promise.resolve(null),
  )

  const abrirViaje = (recorridoId: number) =>
    navegar(`/panel/conductores/${conductorId}/viajes/${recorridoId}`, { state: { volver: `${pathname}${search}` } })

  const sinEventos = completo ? resumen.datos?.total === 0 : !tipo && lista.datos?.total === 0
  const error = errorPlan ?? resumen.error ?? lista.error ?? mapa.error

  if (completo === null && !errorPlan) return null

  return (
    <>
      <div className="mt-5 flex flex-col gap-3">
        <FiltroTipoEvento
          valor={tipo}
          total={resumen.datos?.total ?? null}
          conteo={resumen.datos?.por_tipo ?? null}
          alCambiar={(nuevo) => alCambiar({ tipo: nuevo ?? undefined })}
        />
        <BotonesPeriodo
          opciones={PERIODOS}
          valor={periodo}
          bloqueadas={periodosBloqueados(plan)}
          alCambiar={(nuevo) => alCambiar({ periodo: nuevo })}
        />
      </div>

      {error && (
        <div className="mt-5">
          <AvisoError mensaje={error} />
        </div>
      )}

      {sinEventos ? (
        <SinEventos nombre={nombre} periodo={periodo} alVerTodo={() => alCambiar({ periodo: "todo" })} />
      ) : (
        <>
          {completo ? (
            resumen.datos && (
              <div className="mt-5">
                <ResumenPatrones resumen={resumen.datos} />
              </div>
            )
          ) : (
            <FuncionBloqueada titulo="Patrones de riesgo" className="mt-5" compacto>
              Tu plan muestra el historial de eventos en lista. Mejora tu plan para ver el tipo, el día y la franja con
              más eventos.
            </FuncionBloqueada>
          )}

          <div className={cn("mt-5 grid items-start gap-5", completo && "xl:grid-cols-[3fr_2fr]")}>
            {completo ? (
            <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-subtitulo-grande">Dónde ocurrieron</h2>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-cuerpo-pequeno text-muted-foreground">
                  {TIPOS_EVENTO.map((t) => (
                    <li key={t} className="inline-flex items-center gap-1.5">
                      <span className={cn("size-2.5 rounded-full", ESTILO_EVENTO[t].punto)} aria-hidden="true" />
                      {ESTILO_EVENTO[t].plural}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={cn(mapa.cargando && "opacity-60 transition-opacity")}>
                {mapa.datos && (
                  <MapaEventosConductor
                    // El mapa se reencuadra al cambiar los eventos mostrados
                    key={`${periodo}:${tipo}`}
                    puntos={mapa.datos.puntos}
                    zonas={mapa.datos.zonas}
                    alElegir={(punto) => abrirViaje(punto.recorrido_id)}
                  />
                )}
              </div>
              <p className="mt-3 text-cuerpo-pequeno text-muted-foreground">
                Las zonas marcadas con línea punteada agrupan eventos del mismo tipo en un mismo lugar.
                {mapa.datos?.truncado && " Se muestran los eventos más recientes."}
              </p>
            </section>
            ) : (
              <FuncionBloqueada titulo="Mapa de eventos" compacto>
                Mejora tu plan para ver dónde ocurrieron los eventos y las zonas donde se repiten.
              </FuncionBloqueada>
            )}

            <HistorialEventos
              eventos={lista.datos?.eventos ?? []}
              total={lista.datos?.total ?? 0}
              pagina={pagina}
              porPagina={EVENTOS_POR_PAGINA}
              cargando={lista.cargando}
              vacio={tipo ? "No hay eventos de este tipo en el periodo." : "No hay eventos en el periodo."}
              alElegir={(evento) => abrirViaje(evento.recorrido_id)}
              alCambiarPagina={(nueva) => alCambiar({ pagina: String(nueva) })}
            />
          </div>
        </>
      )}
    </>
  )
}

function SinEventos({
  nombre,
  periodo,
  alVerTodo,
}: {
  nombre: string
  periodo: Periodo
  alVerTodo: () => void
}) {
  return (
    <section className="mt-5 flex flex-col items-center rounded-xl border border-border bg-card px-5 py-16 text-center shadow-tarjeta">
      <span className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-8" aria-hidden="true" />
      </span>
      <h2 className="mt-6 text-titulo">Sin eventos de riesgo en este periodo</h2>
      <p className="mt-2 max-w-lg text-cuerpo text-muted-foreground">
        {primerNombre(nombre)} no registró frenadas bruscas, aceleraciones severas, giros agresivos ni excesos de
        velocidad {CUANDO[periodo]}.
      </p>
      {periodo !== "todo" && (
        <Button className="mt-6" onClick={alVerTodo}>
          Ver todo el tiempo
        </Button>
      )}
    </section>
  )
}
