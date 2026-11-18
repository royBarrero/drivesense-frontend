import { useEffect, useState } from "react"
import { ArrowDownWideNarrow, ArrowUpNarrowWide, CalendarDays, Download, ListOrdered, Search, TriangleAlert, UserPlus, Users, Gauge } from "lucide-react"
import { useSearchParams } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { TarjetaKpi } from "@/components/kpi-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useConsulta } from "@/hooks/use-consulta"
import { formatearEntero } from "@/lib/format"
import { NOMBRE_CALIFICACION, TEXTO_CALIFICACION } from "@/lib/score"
import { cn } from "@/lib/utils"

import { listarConductores, obtenerResumen } from "../api"
import { AvisoLimiteConductores } from "@/features/suscripciones/components/driver-limit-notice"
import { NotaHistorial } from "@/features/suscripciones/components/history-note"
import { limiteDeConductoresAlcanzado, periodosBloqueados, usePlan } from "@/features/suscripciones/plan-context"
import { DialogoExportarReporte } from "../components/export-report-dialog"
import { DialogoNuevaContrasenia } from "../components/new-password-dialog"
import { DialogoRegistro } from "../components/register-dialog"
import { TablaConductores } from "../components/drivers-table"
import {
  CONDUCTORES_POR_PAGINA,
  esOrden,
  esPeriodo,
  ORDEN_INICIAL,
  ORDENES,
  PERIODO_INICIAL,
  PERIODOS,
} from "../constants"
import type { ConductorFlota, Direccion, FiltrosConductores } from "../types"

/** Conductores de la flota: resumen, búsqueda, filtros en la URL y alta de conductores. */
export function ConductoresPagina() {
  const [parametros, setParametros] = useSearchParams()
  const { plan, recargar: recargarPlan } = usePlan()
  const limiteAlcanzado = limiteDeConductoresAlcanzado(plan)

  const periodoUrl = parametros.get("periodo")
  const bloqueados = periodosBloqueados(plan)
  const periodo = esPeriodo(periodoUrl) && !bloqueados.includes(periodoUrl) ? periodoUrl : PERIODO_INICIAL
  const ordenUrl = parametros.get("orden")
  const orden = esOrden(ordenUrl) ? ordenUrl : ORDEN_INICIAL
  const direccion: Direccion = parametros.get("dir") === "asc" ? "asc" : "desc"
  const busqueda = parametros.get("q") ?? ""
  const pagina = Math.max(1, Number(parametros.get("pagina")) || 1)

  /** Cambia los filtros; cualquier cambio que no sea de página vuelve a la primera. */
  const cambiar = (cambios: Record<string, string | undefined>) => {
    const nuevos = new URLSearchParams(parametros)
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === undefined || valor === "") nuevos.delete(clave)
      else nuevos.set(clave, valor)
    }
    if (!("pagina" in cambios)) nuevos.delete("pagina")
    setParametros(nuevos, { replace: true })
  }

  // La búsqueda se escribe sin demora y se aplica al dejar de teclear
  const [texto, setTexto] = useState(busqueda)
  useEffect(() => {
    const espera = setTimeout(() => {
      if (texto.trim() !== busqueda.trim()) cambiar({ q: texto.trim() })
    }, 300)
    return () => clearTimeout(espera)
    // `cambiar` se recrea en cada render y solo importa lo que se escribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto])

  const filtros: FiltrosConductores = { periodo, q: busqueda.trim() || undefined, orden, direccion }
  const claveFiltros = JSON.stringify(filtros)
  const resumen = useConsulta(`resumen:${periodo}`, () => obtenerResumen(periodo))
  const lista = useConsulta(`lista:${claveFiltros}:${pagina}`, () =>
    listarConductores(filtros, pagina, CONDUCTORES_POR_PAGINA),
  )

  const [registrando, setRegistrando] = useState(false)
  const [exportando, setExportando] = useState(false)
  const [conNuevaClave, setConNuevaClave] = useState<ConductorFlota | null>(null)

  const r = resumen.datos
  const total = lista.datos?.total ?? 0
  const primero = (pagina - 1) * CONDUCTORES_POR_PAGINA + 1
  const ultimo = primero - 1 + (lista.datos?.conductores.length ?? 0)
  const nombrePeriodo = PERIODOS.find((p) => p.valor === periodo)?.nombre

  const recargar = () => {
    resumen.recargar()
    lista.recargar()
  }

  return (
    <>
      <title>Conductores · DriveSense</title>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-etiqueta-grande text-texto-exito uppercase">Flota</p>
          <h1 className="mt-1 text-titulo-hero">Conductores</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" onClick={() => setExportando(true)}>
            <Download />
            Exportar reporte
          </Button>
          <Button onClick={() => setRegistrando(true)} disabled={limiteAlcanzado}>
            <UserPlus />
            Registrar conductor
          </Button>
        </div>
      </header>
      <AvisoLimiteConductores />
      <NotaHistorial />

      {resumen.error && (
        <div className="mt-6">
          <AvisoError mensaje={resumen.error} />
        </div>
      )}
      <section className="mt-6 grid gap-5 sm:grid-cols-3" aria-label="Resumen de la flota">
        <TarjetaKpi
          etiqueta="Conductores"
          icono={Users}
          claseIcono="bg-tinte-secundario text-texto-evento-velocidad"
          cargando={resumen.cargando}
          valor={r ? formatearEntero(r.conductores) : "—"}
          detalle="activos en tu empresa"
        />
        <TarjetaKpi
          etiqueta="DriveScore promedio"
          icono={Gauge}
          claseIcono="bg-tinte-primario text-texto-exito"
          cargando={resumen.cargando}
          valor={r?.drivescore_promedio != null ? r.drivescore_promedio : "—"}
          detalle={
            r?.calificacion ? (
              <span className={cn("font-semibold", TEXTO_CALIFICACION[r.calificacion])}>
                {NOMBRE_CALIFICACION[r.calificacion]}
              </span>
            ) : (
              r && "Sin viajes en el periodo"
            )
          }
        />
        <TarjetaKpi
          etiqueta="Eventos de riesgo"
          icono={TriangleAlert}
          claseIcono="bg-tinte-advertencia text-texto-evento-giro"
          cargando={resumen.cargando}
          valor={r ? formatearEntero(r.eventos) : "—"}
          detalle={nombrePeriodo}
        />
      </section>

      <section className="mt-6 rounded-xl border border-border bg-card shadow-tarjeta">
        <div className="flex flex-wrap items-center gap-3 p-5">
          <div className="relative w-full sm:w-72">
            <Search
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-texto-terciario"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Buscar por nombre o correo"
              aria-label="Buscar conductor"
              maxLength={100}
              className="h-11 pl-12"
            />
          </div>
          <Select value={periodo} onValueChange={(nuevo) => cambiar({ periodo: nuevo })}>
            <SelectTrigger aria-label="Periodo">
              <CalendarDays aria-hidden="true" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              {PERIODOS.map((p) => (
                <SelectItem key={p.valor} value={p.valor}>
                  {p.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Select value={orden} onValueChange={(nuevo) => cambiar({ orden: nuevo })}>
              <SelectTrigger aria-label="Ordenar por">
                <ListOrdered aria-hidden="true" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                {ORDENES.map((o) => (
                  <SelectItem key={o.valor} value={o.valor}>
                    {o.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => cambiar({ dir: direccion === "desc" ? "asc" : undefined })}
              title={direccion === "desc" ? "De mayor a menor" : "De menor a mayor"}
            >
              {direccion === "desc" ? <ArrowDownWideNarrow /> : <ArrowUpNarrowWide />}
              <span className="sr-only">
                {direccion === "desc" ? "Orden de mayor a menor" : "Orden de menor a mayor"}
              </span>
            </Button>
          </div>
        </div>

        {lista.error && (
          <div className="px-5 pb-4">
            <AvisoError mensaje={lista.error} />
          </div>
        )}
        {lista.datos && total === 0 && !lista.cargando ? (
          <p className="border-t border-border px-5 py-12 text-center text-cuerpo text-muted-foreground">
            {busqueda.trim()
              ? "Ningún conductor coincide con la búsqueda."
              : "Todavía no tienes conductores. Registra el primero con el botón de arriba."}
          </p>
        ) : (
          <div className={cn(lista.cargando && "opacity-60")}>
            <TablaConductores conductores={lista.datos?.conductores ?? []} alNuevaContrasenia={setConNuevaClave} />
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <p className="text-cuerpo text-muted-foreground">
            {total > 0 ? `Mostrando ${primero}–${ultimo} de ${formatearEntero(total)} conductores` : " "}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" disabled={pagina === 1} onClick={() => cambiar({ pagina: String(pagina - 1) })}>
              Anterior
            </Button>
            <Button variant="outline" disabled={ultimo >= total} onClick={() => cambiar({ pagina: String(pagina + 1) })}>
              Siguiente
            </Button>
          </div>
        </div>
      </section>

      <DialogoRegistro abierto={registrando} alCerrar={() => setRegistrando(false)} alRegistrar={() => {
          recargar()
          recargarPlan()
        }}
      />
      <DialogoNuevaContrasenia conductor={conNuevaClave} alCerrar={() => setConNuevaClave(null)} />
      <DialogoExportarReporte abierto={exportando} alCerrar={() => setExportando(false)} periodoInicial={periodo} />
    </>
  )
}
