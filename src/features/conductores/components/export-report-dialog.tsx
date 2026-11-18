import { useState } from "react"
import { Loader2 } from "lucide-react"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { FuncionBloqueada } from "@/features/suscripciones/components/locked-feature"
import { incluye, usePlan } from "@/features/suscripciones/plan-context"
import { ErrorApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

import { exportarReporteConductor, exportarReporteFlota } from "../api"
import type { FormatoReporte, OpcionesReporte, Periodo, PeriodoReporte } from "../types"

const PERIODOS_REPORTE: { valor: PeriodoReporte; nombre: string }[] = [
  { valor: "7d", nombre: "Últimos 7 días" },
  { valor: "30d", nombre: "Últimos 30 días" },
  { valor: "todo", nombre: "Todo el tiempo" },
  { valor: "rango", nombre: "Rango de fechas" },
]

const FORMATOS: { valor: FormatoReporte; nombre: string; detalle: string }[] = [
  { valor: "pdf", nombre: "PDF", detalle: "Para leer o imprimir" },
  { valor: "csv", nombre: "CSV", detalle: "Para abrir en Excel" },
]

/** Hoy en la zona del navegador, `AAAA-MM-DD` (tope del selector de fechas). */
function hoyIso() {
  const ahora = new Date()
  const mes = String(ahora.getMonth() + 1).padStart(2, "0")
  const dia = String(ahora.getDate()).padStart(2, "0")
  return `${ahora.getFullYear()}-${mes}-${dia}`
}

/** Mensaje del primer campo inválido que devuelve la API, o el del error. */
function mensajeDe(e: unknown) {
  if (!(e instanceof ErrorApi)) return ErrorApi.INESPERADO
  return e.errores[0]?.mensaje ?? e.mensaje
}

function OpcionRadio({
  grupo,
  valor,
  seleccionada,
  children,
}: {
  grupo: string
  valor: string
  seleccionada: boolean
  children: React.ReactNode
}) {
  const id = `${grupo}-${valor}`
  return (
    <Label
      htmlFor={id}
      className={cn(
        "cursor-pointer gap-3 rounded-lg border p-3 text-cuerpo",
        seleccionada ? "border-primary bg-tinte-primario" : "border-border bg-card",
      )}
    >
      <RadioGroupItem value={valor} id={id} />
      {children}
    </Label>
  )
}

/**
 * Pide periodo y formato y descarga el reporte de desempeño (HU-27): el de un conductor si
 * llega `conductor`, el de toda la flota si no. Sin viajes en el periodo, el aviso queda en
 * el diálogo y no se descarga nada.
 */
export function DialogoExportarReporte({
  abierto,
  alCerrar,
  conductor,
  periodoInicial,
}: {
  abierto: boolean
  alCerrar: () => void
  conductor?: { id: number; nombre: string }
  periodoInicial: Periodo
}) {
  return (
    <Dialog open={abierto} onOpenChange={(abrir) => !abrir && alCerrar()}>
      {/* `key`: al reabrirlo parte del periodo de la página y sin errores */}
      <ContenidoExportar key={String(abierto)} alCerrar={alCerrar} conductor={conductor} periodoInicial={periodoInicial} />
    </Dialog>
  )
}

function ContenidoExportar({
  alCerrar,
  conductor,
  periodoInicial,
}: {
  alCerrar: () => void
  conductor?: { id: number; nombre: string }
  periodoInicial: Periodo
}) {
  const { plan } = usePlan()
  const [periodo, setPeriodo] = useState<PeriodoReporte>(periodoInicial)
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [formato, setFormato] = useState<FormatoReporte>("pdf")
  const [exportando, setExportando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDePlan, setErrorDePlan] = useState(false)

  const hoy = hoyIso()
  const rango = periodo === "rango"
  const errorRango = !rango
    ? null
    : !desde || !hasta
      ? "Elige la fecha de inicio y la de fin."
      : hasta < desde
        ? "La fecha de fin no puede ser anterior a la de inicio."
        : hasta > hoy
          ? "La fecha de fin no puede ser futura."
          : null

  const exportar = async () => {
    const opciones: OpcionesReporte = { periodo, formato, ...(rango ? { desde, hasta } : {}) }
    setExportando(true)
    setError(null)
    setErrorDePlan(false)
    try {
      if (conductor) await exportarReporteConductor(conductor.id, opciones)
      else await exportarReporteFlota(opciones)
      alCerrar()
    } catch (e) {
      setError(mensajeDe(e))
      setErrorDePlan(e instanceof ErrorApi && e.esDePlan)
    } finally {
      setExportando(false)
    }
  }

  // El plan Gratis no exporta: el diálogo invita a mejorarlo (el backend también lo rechaza)
  if (incluye(plan, "exportar") === false) {
    return (
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Exportar reporte</DialogTitle>
          <DialogDescription>Reportes de desempeño en PDF y CSV.</DialogDescription>
        </DialogHeader>
        <FuncionBloqueada titulo="Exportar no está en tu plan" compacto alNavegar={alCerrar}>
          Mejora tu plan para descargar el reporte de desempeño de tus conductores y de toda la flota.
        </FuncionBloqueada>
      </DialogContent>
    )
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Exportar reporte</DialogTitle>
        <DialogDescription>
          {conductor
            ? `Desempeño de ${conductor.nombre}: DriveScore, categorías, eventos y viajes.`
            : "Desempeño de toda la flota: resumen y una fila por conductor."}{" "}
          No incluye rutas ni ubicaciones.
        </DialogDescription>
      </DialogHeader>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-etiqueta-grande text-muted-foreground uppercase">Periodo</legend>
        <RadioGroup value={periodo} onValueChange={(v) => setPeriodo(v as PeriodoReporte)} className="grid-cols-2">
          {PERIODOS_REPORTE.map((p) => (
            <OpcionRadio key={p.valor} grupo="periodo" valor={p.valor} seleccionada={periodo === p.valor}>
              {p.nombre}
            </OpcionRadio>
          ))}
        </RadioGroup>
        {rango && (
          <div className="mt-1 grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="reporte-desde">Desde</Label>
              <Input id="reporte-desde" type="date" value={desde} max={hoy} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="reporte-hasta">Hasta</Label>
              <Input
                id="reporte-hasta"
                type="date"
                value={hasta}
                max={hoy}
                min={desde || undefined}
                onChange={(e) => setHasta(e.target.value)}
              />
            </div>
            {desde && hasta && errorRango && <p className="col-span-2 text-ayuda text-destructive">{errorRango}</p>}
          </div>
        )}
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="mb-1 text-etiqueta-grande text-muted-foreground uppercase">Formato</legend>
        <RadioGroup value={formato} onValueChange={(v) => setFormato(v as FormatoReporte)} className="grid-cols-2">
          {FORMATOS.map((f) => (
            <OpcionRadio key={f.valor} grupo="formato" valor={f.valor} seleccionada={formato === f.valor}>
              <span className="grid gap-1">
                <span className="font-semibold">{f.nombre}</span>
                <span className="text-ayuda font-normal text-muted-foreground">{f.detalle}</span>
              </span>
            </OpcionRadio>
          ))}
        </RadioGroup>
      </fieldset>

      {error && <AvisoError mensaje={error} mejorarPlan={errorDePlan} />}
      <DialogFooter>
        <Button variant="outline" onClick={alCerrar}>
          Cancelar
        </Button>
        <Button onClick={exportar} disabled={errorRango !== null || exportando} aria-busy={exportando}>
          {exportando && <Loader2 className="animate-spin" aria-label="Exportando" />}
          Exportar
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
