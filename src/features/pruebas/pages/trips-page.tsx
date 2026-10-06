import { useState } from "react"
import { Download, Loader2, Lock, TriangleAlert, Users } from "lucide-react"
import { useLocation, useSearchParams } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorApi } from "@/lib/api-client"
import { formatearDecimal, formatearEntero } from "@/lib/format"
import { cn } from "@/lib/utils"

import { descargarCsv, listarRecorridos, listarTesters, obtenerResumen } from "../api"
import { TarjetaKpi } from "../components/kpi-card"
import { SelectorPeriodo } from "../components/period-select"
import { TablaTesters } from "../components/testers-table"
import { TablaViajes } from "../components/trips-table"
import { VIAJES_POR_PAGINA } from "../constants"
import { desdePeriodo, esPeriodo, PERIODOS, type Periodo } from "../period"
import type { FiltroEventos, FiltrosRecorridos } from "../types"
import { useConsulta } from "../use-query"

const TODOS = "todos"

/** Pruebas · Viajes de los testers (temporal). Los filtros viven en la URL. */
export function ViajesPruebasPagina() {
  const [parametros, setParametros] = useSearchParams()
  const { pathname, search } = useLocation()

  const vista = parametros.get("vista") === "testers" ? "testers" : "viajes"
  const periodoUrl = parametros.get("periodo")
  const periodo: Periodo = esPeriodo(periodoUrl) ? periodoUrl : "7d"
  const testerId = Number(parametros.get("tester")) || undefined
  const eventosUrl = parametros.get("eventos")
  const eventos: FiltroEventos | undefined = eventosUrl === "con" || eventosUrl === "sin" ? eventosUrl : undefined
  const pagina = Math.max(1, Number(parametros.get("pagina")) || 1)

  /** Cambia los filtros; cualquier cambio que no sea de página vuelve a la primera. */
  const cambiar = (cambios: Record<string, string | undefined>) => {
    const nuevos = new URLSearchParams(parametros)
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === undefined) nuevos.delete(clave)
      else nuevos.set(clave, valor)
    }
    if (!("pagina" in cambios)) nuevos.delete("pagina")
    setParametros(nuevos, { replace: true })
  }

  const desde = desdePeriodo(periodo)
  const filtros: FiltrosRecorridos = { desde, usuario_id: testerId, eventos }
  const claveFiltros = JSON.stringify(filtros)

  const resumen = useConsulta(`resumen:${desde}:${testerId}`, () => obtenerResumen(desde, testerId))
  const testers = useConsulta(`testers:${desde}`, () => listarTesters(desde))
  const viajes = useConsulta(`viajes:${claveFiltros}:${pagina}`, () =>
    listarRecorridos(filtros, pagina, VIAJES_POR_PAGINA),
  )

  const [exportando, setExportando] = useState(false)
  const [errorExportar, setErrorExportar] = useState<string | null>(null)
  const exportar = async () => {
    setExportando(true)
    setErrorExportar(null)
    try {
      await descargarCsv(filtros)
    } catch (e) {
      setErrorExportar(e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO)
    } finally {
      setExportando(false)
    }
  }

  const r = resumen.datos
  const total = viajes.datos?.total ?? 0
  const primero = (pagina - 1) * VIAJES_POR_PAGINA + 1
  const ultimo = primero - 1 + (viajes.datos?.recorridos.length ?? 0)

  return (
    <>
      <title>Pruebas · DriveSense</title>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-etiqueta-grande text-texto-evento-giro uppercase">Pruebas</p>
          <h1 className="mt-1 text-titulo-hero">Viajes de los testers</h1>
        </div>
        <nav className="flex rounded-full bg-carril p-1" aria-label="Vista">
          <Pestania activa={vista === "viajes"} alElegir={() => cambiar({ vista: undefined })}>
            Viajes
          </Pestania>
          <Pestania activa={vista === "testers"} alElegir={() => cambiar({ vista: "testers" })}>
            Testers
          </Pestania>
        </nav>
      </header>

      <p className="mt-6 flex items-start gap-3 rounded-lg border border-advertencia/30 bg-tinte-advertencia px-4 py-3 text-cuerpo font-medium text-texto-evento-giro">
        <Lock className="mt-px size-5 shrink-0" aria-hidden="true" />
        Sección temporal, solo para la cuenta de pruebas. Muestra los viajes de todos los testers y se quitará
        cuando exista el panel empresarial.
      </p>

      {resumen.error && (
        <div className="mt-6">
          <AvisoError mensaje={resumen.error} />
        </div>
      )}
      <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen">
        <TarjetaKpi
          etiqueta="Viajes"
          cargando={resumen.cargando}
          valor={r ? formatearEntero(r.viajes) : "—"}
          detalle={
            r &&
            `${PERIODOS.find((p) => p.valor === periodo)?.nombre}${r.descartados ? ` · ${r.descartados} descartados` : ""}`
          }
        />
        <TarjetaKpi
          etiqueta="Kilómetros"
          cargando={resumen.cargando}
          valor={r ? formatearEntero(r.distancia_m / 1000) : "—"}
        />
        <TarjetaKpi
          etiqueta="Eventos por 10 km"
          cargando={resumen.cargando}
          valor={r?.eventos_por_10km != null ? formatearDecimal(r.eventos_por_10km) : "—"}
          detalle={r && `${formatearEntero(r.eventos)} eventos en total`}
        />
        <TarjetaKpi
          etiqueta="Testers activos"
          cargando={resumen.cargando}
          valor={r ? formatearEntero(r.testers) : "—"}
          detalle={r && `de ${formatearEntero(r.testers_registrados)} registrados`}
        />
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card shadow-tarjeta">
        <div className="flex flex-wrap items-center gap-3 p-5">
          {vista === "viajes" && (
            <Select
              value={testerId ? String(testerId) : TODOS}
              onValueChange={(valor) => cambiar({ tester: valor === TODOS ? undefined : valor })}
            >
              <SelectTrigger aria-label="Tester" className="max-w-64">
                <Users aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={TODOS}>Todos los testers</SelectItem>
                {testers.datos?.map((t) => (
                  <SelectItem key={t.id} value={String(t.id)}>
                    {t.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <SelectorPeriodo valor={periodo} alCambiar={(nuevo) => cambiar({ periodo: nuevo })} conRango />
          {vista === "viajes" && (
            <Select value={eventos ?? TODOS} onValueChange={(valor) => cambiar({ eventos: valor === TODOS ? undefined : valor })}>
              <SelectTrigger aria-label="Eventos">
                <TriangleAlert aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value={TODOS}>Todos los viajes</SelectItem>
                <SelectItem value="con">Con eventos</SelectItem>
                <SelectItem value="sin">Sin eventos</SelectItem>
              </SelectContent>
            </Select>
          )}
          {vista === "viajes" && (
            <Button className="ml-auto" onClick={exportar} disabled={total === 0} aria-busy={exportando}>
              {exportando ? <Loader2 className="animate-spin" aria-label="Exportando" /> : <Download />}
              Exportar CSV
            </Button>
          )}
        </div>
        {errorExportar && (
          <div className="px-5 pb-4">
            <AvisoError mensaje={errorExportar} />
          </div>
        )}

        {vista === "viajes" ? (
          <>
            {viajes.error && (
              <div className="px-5 pb-4">
                <AvisoError mensaje={viajes.error} />
              </div>
            )}
            {viajes.datos && total === 0 && !viajes.cargando ? (
              <p className="border-t border-border px-5 py-12 text-center text-cuerpo text-muted-foreground">
                No hay viajes con estos filtros.
              </p>
            ) : (
              <div className={cn(viajes.cargando && "opacity-60")}>
                <TablaViajes recorridos={viajes.datos?.recorridos ?? []} volver={`${pathname}${search}`} />
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <p className="text-cuerpo text-muted-foreground">
                {total > 0 ? `Mostrando ${primero}–${ultimo} de ${formatearEntero(total)} viajes` : " "}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={pagina === 1}
                  onClick={() => cambiar({ pagina: String(pagina - 1) })}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  disabled={ultimo >= total}
                  onClick={() => cambiar({ pagina: String(pagina + 1) })}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            {testers.error && (
              <div className="px-5 pb-4">
                <AvisoError mensaje={testers.error} />
              </div>
            )}
            <div className={cn("pb-2", testers.cargando && "opacity-60")}>
              <TablaTesters
                testers={testers.datos ?? []}
                alElegir={(id) => cambiar({ vista: undefined, tester: String(id) })}
              />
            </div>
          </>
        )}
      </section>

    </>
  )
}

function Pestania({ activa, alElegir, children }: { activa: boolean; alElegir: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={alElegir}
      aria-pressed={activa}
      className={cn(
        "h-10 rounded-full px-5 text-cuerpo font-semibold transition-colors",
        activa ? "bg-card text-foreground shadow-tarjeta" : "text-muted-foreground hover:text-foreground",
      )}
    >
      {children}
    </button>
  )
}
