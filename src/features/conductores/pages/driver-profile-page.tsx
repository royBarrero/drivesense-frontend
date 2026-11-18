import { lazy, Suspense, useState } from "react"
import { ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Download, Loader2 } from "lucide-react"
import { Link, useLocation, useParams, useSearchParams } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { EventosPorTipo } from "@/components/event-counts"
import { BotonesPeriodo } from "@/components/period-buttons"
import { TarjetaKpi } from "@/components/kpi-card"
import { DistintivoPuntaje } from "@/components/score-badge"
import { Desglose } from "@/components/score-breakdown"
import { AvatarUsuario } from "@/components/user-avatar"
import { useConsulta } from "@/hooks/use-consulta"
import { formatearDecimal, formatearEntero, formatearKm } from "@/lib/format"
import type { TipoEvento } from "@/lib/trip-types"
import { cn } from "@/lib/utils"

import { listarViajesRecientes, obtenerPerfil } from "../api"
import { NotaHistorial } from "@/features/suscripciones/components/history-note"
import { periodosBloqueados, usePlan } from "@/features/suscripciones/plan-context"
import { DialogoExportarReporte } from "../components/export-report-dialog"
import { GraficoEvolucion } from "@/components/evolution-chart"
import { TablaViajesRecientes } from "../components/recent-trips-table"
import { DistintivoRiesgo } from "../components/risk-badge"
import { esPeriodo, esTipoEvento, esVista, PERIODO_INICIAL, PERIODOS, VISTAS } from "../constants"
import type { BaseTendencia, Categoria, PerfilConductor, Periodo, ViajeConductor, Vista } from "../types"

// La pestaña de eventos trae Leaflet (el mapa): se carga solo al abrirla
const PestaniaEventos = lazy(() =>
  import("../components/risk-events-tab").then((modulo) => ({ default: modulo.PestaniaEventos })),
)

const CATEGORIA_DE_TIPO: Record<TipoEvento, Categoria> = {
  exceso_velocidad: "velocidad",
  frenada_brusca: "frenadas",
  giro_agresivo: "giros",
  aceleracion_severa: "aceleraciones",
}

/**
 * Perfil de un conductor de la flota: pestañas Resumen (HU-25) y Eventos de riesgo (HU-26).
 * La pestaña, el periodo, el tipo de evento y la página viven en la URL.
 */
export function PerfilConductorPagina() {
  const { id } = useParams()
  const conductorId = Number(id)
  const estado = useLocation().state as { volver?: string; volverTexto?: string } | null
  const volver = estado?.volver ?? "/panel/conductores"
  const [parametros, setParametros] = useSearchParams()
  const periodoUrl = parametros.get("periodo")
  const { plan } = usePlan()
  const bloqueados = periodosBloqueados(plan)
  const periodo: Periodo =
    esPeriodo(periodoUrl) && !bloqueados.includes(periodoUrl) ? periodoUrl : PERIODO_INICIAL
  const vistaUrl = parametros.get("vista")
  const vista: Vista = esVista(vistaUrl) ? vistaUrl : "resumen"
  const tipoUrl = parametros.get("tipo")
  const tipo = esTipoEvento(tipoUrl) ? tipoUrl : null
  const pagina = Math.max(1, Number(parametros.get("pagina")) || 1)

  /** Cambia la URL conservando el "volver" al listado; todo cambio que no sea de página vuelve a la primera. */
  const cambiar = (cambios: Record<string, string | undefined>) => {
    const nuevos = new URLSearchParams(parametros)
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === undefined) nuevos.delete(clave)
      else nuevos.set(clave, valor)
    }
    if (!("pagina" in cambios)) nuevos.delete("pagina")
    setParametros(nuevos, { replace: true, state: estado })
  }

  const perfil = useConsulta(`perfil:${conductorId}:${periodo}`, () => obtenerPerfil(conductorId, periodo))
  const [exportando, setExportando] = useState(false)

  return (
    <>
      <title>Conductor · DriveSense</title>
      <Link to={volver} className="inline-flex items-center gap-2 text-cuerpo font-semibold text-enlace hover:underline">
        <ArrowLeft className="size-5" aria-hidden="true" />
        {estado?.volverTexto ?? "Volver a conductores"}
      </Link>

      {perfil.error && (
        <div className="mt-6">
          <AvisoError mensaje={perfil.error} />
        </div>
      )}
      {perfil.cargando && !perfil.datos && (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" aria-label="Cargando el perfil" />
        </div>
      )}
      {perfil.datos && (
        <>
          <section className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-xl border border-border bg-card p-5 shadow-tarjeta">
            <AvatarUsuario id={perfil.datos.conductor.id} nombre={perfil.datos.conductor.nombre} grande />
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-titulo">{perfil.datos.conductor.nombre}</h1>
              <p className="mt-1 truncate text-cuerpo text-muted-foreground">{perfil.datos.conductor.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-cuerpo font-medium text-muted-foreground">DriveScore</span>
              <DistintivoPuntaje drivescore={perfil.datos.drivescore} calificacion={perfil.datos.calificacion} />
            </div>
            <BotonesPeriodo
              nombre="Vista"
              opciones={VISTAS}
              valor={vista}
              alCambiar={(nueva) => cambiar({ vista: nueva === "resumen" ? undefined : nueva, tipo: undefined })}
            />
            <Button variant="outline" onClick={() => setExportando(true)}>
              <Download />
              Exportar reporte
            </Button>
          </section>
          <NotaHistorial />
          <DialogoExportarReporte
            abierto={exportando}
            alCerrar={() => setExportando(false)}
            conductor={{ id: perfil.datos.conductor.id, nombre: perfil.datos.conductor.nombre }}
            periodoInicial={periodo}
          />

          {vista === "resumen" ? (
            <ResumenPerfil
              perfil={perfil.datos}
              periodo={periodo}
              alCambiarPeriodo={(nuevo) => cambiar({ periodo: nuevo })}
              cargando={perfil.cargando}
            />
          ) : (
            <Suspense
              fallback={
                <div className="flex justify-center py-20">
                  <Loader2 className="size-8 animate-spin text-primary" aria-label="Cargando los eventos" />
                </div>
              }
            >
              <PestaniaEventos
                conductorId={conductorId}
                nombre={perfil.datos.conductor.nombre}
                periodo={periodo}
                tipo={tipo}
                pagina={pagina}
                alCambiar={cambiar}
              />
            </Suspense>
          )}
        </>
      )}
    </>
  )
}

function ResumenPerfil({
  perfil,
  periodo,
  alCambiarPeriodo,
  cargando,
}: {
  perfil: PerfilConductor
  periodo: Periodo
  alCambiarPeriodo: (periodo: Periodo) => void
  cargando: boolean
}) {
  const { plan } = usePlan()
  const viajes = useConsulta(`viajes:${perfil.conductor.id}:${periodo}`, () =>
    listarViajesRecientes(perfil.conductor.id, periodo),
  )
  const sinDatos = perfil.viajes === 0
  const nombrePeriodo = PERIODOS.find((p) => p.valor === periodo)?.nombre

  return (
    <div className={cn(cargando && "opacity-60 transition-opacity")}>
      <div className="mt-5">
        <BotonesPeriodo
          opciones={PERIODOS}
          valor={periodo}
          alCambiar={alCambiarPeriodo}
          bloqueadas={periodosBloqueados(plan)}
        />
      </div>

      {sinDatos ? (
        <section className="mt-5 rounded-xl border border-dashed border-borde-fuerte bg-muted px-5 py-12 text-center">
          <p className="text-subtitulo-grande">Todavía no hay datos</p>
          <p className="mt-1 text-cuerpo text-muted-foreground">
            {perfil.conductor.nombre} no tiene viajes finalizados en el periodo «{nombrePeriodo}».
            {periodo !== "todo" && " Prueba con un periodo más amplio."}
          </p>
        </section>
      ) : (
        <Contenido perfil={perfil} viajes={viajes.datos} errorViajes={viajes.error} />
      )}
    </div>
  )
}

function Contenido({
  perfil,
  viajes,
  errorViajes,
}: {
  perfil: PerfilConductor
  viajes: ViajeConductor[] | null
  errorViajes: string | null
}) {
  const debil = perfil.punto_debil ? CATEGORIA_DE_TIPO[perfil.punto_debil] : null

  return (
    <>
      <section className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-card p-5 shadow-tarjeta">
        <span className="text-cuerpo font-medium text-muted-foreground">DriveScore promedio</span>
        <DistintivoPuntaje
          drivescore={perfil.drivescore}
          calificacion={perfil.calificacion}
          className="px-4 py-2 text-puntaje"
        />
        {perfil.nivel_riesgo && <DistintivoRiesgo nivel={perfil.nivel_riesgo} />}
      </section>

      <section className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen del periodo">
        <TarjetaKpi etiqueta="Viajes" valor={formatearEntero(perfil.viajes)} />
        <TarjetaKpi etiqueta="Distancia" valor={formatearKm(perfil.distancia_m)} />
        <TarjetaKpi
          etiqueta="Eventos por 10 km"
          valor={perfil.eventos_por_10km !== null ? formatearDecimal(perfil.eventos_por_10km) : "—"}
          detalle={`${formatearEntero(perfil.eventos)} ${perfil.eventos === 1 ? "evento" : "eventos"} en total`}
        />
        <TarjetaTendencia tendencia={perfil.tendencia} base={perfil.tendencia_base} />
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[3fr_2fr]">
        <div className="flex flex-col gap-5">
          <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
            <h2 className="text-subtitulo-grande">Evolución del DriveScore</h2>
            <p className="mt-1 mb-4 text-cuerpo text-muted-foreground">
              {perfil.agrupacion === "viaje" ? "Un punto por viaje." : perfil.agrupacion === "dia" ? "Un punto por día con viajes." : "Un punto por semana."}
            </p>
            <GraficoEvolucion puntos={perfil.evolucion} agrupacion={perfil.agrupacion} />
          </section>

          <section className="rounded-xl border border-border bg-card shadow-tarjeta">
            <h2 className="px-5 pt-5 pb-4 text-subtitulo-grande">Viajes recientes</h2>
            {errorViajes && (
              <div className="px-5 pb-4">
                <AvisoError mensaje={errorViajes} />
              </div>
            )}
            {viajes && viajes.length === 0 ? (
              <p className="border-t border-border px-5 py-10 text-center text-cuerpo text-muted-foreground">
                Sin viajes en este periodo.
              </p>
            ) : (
              <TablaViajesRecientes conductorId={perfil.conductor.id} viajes={viajes ?? []} />
            )}
          </section>
        </div>

        <div className="flex flex-col gap-5">
          {perfil.categorias && (
            <Desglose
              titulo="Puntaje por categoría"
              puntajes={{
                velocidad: perfil.categorias.velocidad.promedio,
                frenadas: perfil.categorias.frenadas.promedio,
                aceleraciones: perfil.categorias.aceleraciones.promedio,
                giros: perfil.categorias.giros.promedio,
              }}
              destacada={debil}
            />
          )}
          <EventosPorTipo
            conteo={perfil.eventos_por_tipo}
            detalle={
              perfil.eventos_por_10km !== null
                ? `${formatearDecimal(perfil.eventos_por_10km)} eventos por cada 10 km`
                : undefined
            }
          />
        </div>
      </div>
    </>
  )
}

const DETALLE_TENDENCIA: Record<BaseTendencia, { con: string; sin: string }> = {
  periodo_anterior: { con: "frente al periodo anterior", sin: "Sin viajes en el periodo anterior" },
  mitades: { con: "segunda mitad frente a la primera", sin: "Aún no hay viajes en las dos mitades" },
}

function TarjetaTendencia({ tendencia, base }: { tendencia: number | null; base: BaseTendencia }) {
  const detalle = DETALLE_TENDENCIA[base]
  if (tendencia === null) {
    return <TarjetaKpi etiqueta="Tendencia" valor="—" detalle={detalle.sin} />
  }
  const Icono = tendencia > 0 ? ArrowUpRight : tendencia < 0 ? ArrowDownRight : ArrowRight
  const color = tendencia > 0 ? "text-texto-exito" : tendencia < 0 ? "text-destructive" : "text-muted-foreground"
  return (
    <TarjetaKpi
      etiqueta="Tendencia"
      valor={
        <span className={cn("inline-flex items-center gap-1", color)}>
          <Icono className="size-7" aria-hidden="true" />
          {tendencia > 0 ? `+${tendencia}` : tendencia}
        </span>
      }
      detalle={detalle.con}
    />
  )
}
