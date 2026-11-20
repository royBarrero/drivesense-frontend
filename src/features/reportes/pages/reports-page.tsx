import { Activity, Gauge, Loader2, Route, TriangleAlert } from "lucide-react"
import { Link, useSearchParams } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { EventosPorTipo } from "@/components/event-counts"
import { GraficoEvolucion } from "@/components/evolution-chart"
import { TarjetaKpi } from "@/components/kpi-card"
import { BotonesPeriodo } from "@/components/period-buttons"
import { esPeriodo, PERIODO_INICIAL, PERIODOS } from "@/features/conductores/constants"
import { periodosBloqueados, usePlan } from "@/features/suscripciones/plan-context"
import { NotaHistorial } from "@/features/suscripciones/components/history-note"
import { FuncionBloqueada } from "@/features/suscripciones/components/locked-feature"
import { useConsulta } from "@/hooks/use-consulta"
import { formatearDecimal, formatearEntero, formatearKm } from "@/lib/format"
import { NOMBRE_CALIFICACION, TEXTO_CALIFICACION } from "@/lib/score"
import { cn } from "@/lib/utils"

import { obtenerTablero } from "../api"
import { DistribucionCalificacion } from "../components/rating-distribution"
import { RankingBarras } from "../components/ranking-bars"
import { DistribucionEstilos } from "../components/style-distribution"

/** Tablero de indicadores de toda la flota; el periodo vive en la URL. */
export function ReportesPagina() {
  const [parametros, setParametros] = useSearchParams()
  const periodoUrl = parametros.get("periodo")
  const { plan } = usePlan()
  const bloqueados = periodosBloqueados(plan)
  const periodo = esPeriodo(periodoUrl) && !bloqueados.includes(periodoUrl) ? periodoUrl : PERIODO_INICIAL
  const nombrePeriodo = PERIODOS.find((p) => p.valor === periodo)?.nombre

  const tablero = useConsulta(`tablero:${periodo}`, () => obtenerTablero(periodo))
  const t = tablero.datos

  return (
    <>
      <title>Reportes · DriveSense</title>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-etiqueta-grande text-texto-exito uppercase">Flota</p>
          <h1 className="mt-1 text-titulo-hero">Reportes</h1>
        </div>
        <BotonesPeriodo
          opciones={PERIODOS}
          valor={periodo}
          bloqueadas={bloqueados}
          alCambiar={(nuevo) => setParametros({ periodo: nuevo }, { replace: true })}
        />
      </header>
      <NotaHistorial />

      {tablero.error && (
        <div className="mt-6">
          <AvisoError mensaje={tablero.error} />
        </div>
      )}
      {tablero.cargando && !t && (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" aria-label="Cargando los reportes" />
        </div>
      )}

      {t && t.conductores === 0 && (
        <Vacio titulo="Todavía no tienes conductores">
          Registra el primero en{" "}
          <Link to="/panel/conductores" className="font-semibold text-enlace hover:underline">
            Conductores
          </Link>{" "}
          para ver aquí los indicadores de tu flota.
        </Vacio>
      )}

      {t && t.conductores > 0 && t.viajes === 0 && (
        <Vacio titulo="Todavía no hay datos">
          Tus conductores no tienen viajes finalizados en el periodo «{nombrePeriodo}».
          {periodo !== "todo" && " Prueba con un periodo más amplio."}
        </Vacio>
      )}

      {t && t.viajes > 0 && (
        <div className={cn("mt-6 flex flex-col gap-5", tablero.cargando && "opacity-60 transition-opacity")}>
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de la flota">
            <TarjetaKpi
              etiqueta="DriveScore promedio"
              icono={Gauge}
              claseIcono="bg-tinte-primario text-texto-exito"
              valor={t.drivescore ?? "—"}
              detalle={
                t.calificacion && (
                  <span className={cn("font-semibold", TEXTO_CALIFICACION[t.calificacion])}>
                    {NOMBRE_CALIFICACION[t.calificacion]}
                  </span>
                )
              }
            />
            <TarjetaKpi
              etiqueta="Kilómetros"
              icono={Route}
              claseIcono="bg-tinte-secundario text-texto-evento-velocidad"
              valor={formatearKm(t.distancia_m)}
              detalle={`${formatearEntero(t.viajes)} ${t.viajes === 1 ? "viaje" : "viajes"} de ${t.conductores_con_viajes} ${t.conductores_con_viajes === 1 ? "conductor" : "conductores"}`}
            />
            <TarjetaKpi
              etiqueta="Eventos por cada 10 km"
              icono={Activity}
              claseIcono="bg-tinte-advertencia text-texto-evento-giro"
              valor={t.eventos_por_10km != null ? formatearDecimal(t.eventos_por_10km) : "—"}
              detalle={`${formatearEntero(t.eventos)} ${t.eventos === 1 ? "evento" : "eventos"} en total`}
            />
            <TarjetaKpi
              etiqueta="Conductores en riesgo"
              icono={TriangleAlert}
              claseIcono="bg-tinte-peligro text-destructive"
              valor={formatearEntero(t.conductores_en_riesgo)}
              detalle={`de ${t.conductores_con_viajes} con viajes · DriveScore menor a 60`}
            />
          </section>

          {!t.completo && (
            <FuncionBloqueada titulo="Reportes completos">
              Tu plan incluye las tarjetas resumen de la flota. Mejora tu plan para ver los rankings de conductores, la
              distribución por calificación y por estilo de conducción, los eventos por tipo y la evolución del DriveScore.
            </FuncionBloqueada>
          )}

          {t.completo && (
          <>
          <section className="grid gap-5 lg:grid-cols-2" aria-label="Rankings de conductores">
            <RankingBarras
              titulo="Conductores destacados"
              descripcion="Los 5 con mejor DriveScore."
              tipo="mejores"
              items={t.mejores}
              vacio={`Ningún conductor supera ${formatearKm(t.distancia_minima_ranking_m)} en este periodo.`}
            />
            <RankingBarras
              titulo="Conductores a vigilar"
              descripcion="Los 5 con más eventos de riesgo por cada 10 km."
              tipo="vigilar"
              items={t.a_vigilar}
              vacio={
                t.mejores.length > 0
                  ? "Ningún conductor tuvo eventos de riesgo en este periodo. ¡Buen trabajo!"
                  : `Ningún conductor supera ${formatearKm(t.distancia_minima_ranking_m)} en este periodo.`
              }
            />
            <p className="text-ayuda text-muted-foreground lg:col-span-2">
              Los rankings incluyen solo a los conductores que recorrieron al menos{" "}
              {formatearKm(t.distancia_minima_ranking_m)} en el periodo. Toca un conductor para abrir su perfil.
            </p>
          </section>

          <section className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3" aria-label="Distribución de la flota">
            <DistribucionCalificacion conteo={t.por_calificacion} />
            <DistribucionEstilos conteo={t.por_estilo} />
            <EventosPorTipo
              conteo={t.eventos_por_tipo}
              titulo="Eventos por tipo"
              detalle="De toda la flota en el periodo."
            />
          </section>

          <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
            <h2 className="text-subtitulo-grande">Evolución del DriveScore</h2>
            <p className="mt-1 text-cuerpo text-muted-foreground">
              Promedio de la flota {t.evolucion.agrupacion === "semana" ? "por semana" : "por día"}.
            </p>
            <div className="mt-4">
              <GraficoEvolucion puntos={t.evolucion.puntos} agrupacion={t.evolucion.agrupacion} />
            </div>
          </section>
          </>
          )}
        </div>
      )}
    </>
  )
}

function Vacio({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 rounded-xl border border-dashed border-borde-fuerte bg-muted px-5 py-12 text-center">
      <p className="text-subtitulo-grande">{titulo}</p>
      <p className="mt-1 text-cuerpo text-muted-foreground">{children}</p>
    </section>
  )
}
