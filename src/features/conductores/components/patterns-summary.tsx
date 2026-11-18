import { Info } from "lucide-react"

import { ESTILO_EVENTO, TIPOS_EVENTO } from "@/lib/events"
import { formatearEntero } from "@/lib/format"
import { cn } from "@/lib/utils"

import { DIAS_SEMANA, DIAS_SEMANA_CORTO, FRANJAS } from "../constants"
import type { ResumenEventos } from "../types"

const CLASE_TARJETA = "rounded-xl border border-border bg-card p-5 shadow-tarjeta"
// Alto máximo de las barras de día y franja, en rem (h-16)
const ALTO_BARRAS_REM = 4

/** Patrones del periodo: tipo, día de la semana y franja con más eventos; o el aviso de que aún no hay. */
export function ResumenPatrones({ resumen }: { resumen: ResumenEventos }) {
  const { patrones } = resumen
  if (!patrones.hay_patron) return <AvisoSinPatron total={resumen.total} minimo={patrones.minimo} />

  const tipo = patrones.tipo_mas_frecuente
  const diaGanador = patrones.dia_mas_frecuente
  const franjaGanadora = patrones.franja_mas_frecuente
  const estilo = tipo ? ESTILO_EVENTO[tipo] : null
  const Icono = estilo?.icono

  return (
    <section className="grid gap-5 lg:grid-cols-3" aria-label="Patrones de los eventos">
      <div className={CLASE_TARJETA}>
        <p className="text-cuerpo font-medium text-muted-foreground">Tipo más frecuente</p>
        {tipo && estilo && Icono && (
          <>
            <div className="mt-3 flex items-center gap-3">
              <span className={cn("flex size-12 shrink-0 items-center justify-center rounded-lg", estilo.tinte, estilo.texto)}>
                <Icono className="size-6" aria-hidden="true" />
              </span>
              <div>
                <p className="text-subtitulo-grande">{estilo.plural}</p>
                <p className="text-cuerpo text-muted-foreground">
                  {formatearEntero(resumen.por_tipo[tipo])} de {formatearEntero(resumen.total)} eventos
                </p>
              </div>
            </div>
            <div
              className="mt-4 flex h-2 overflow-hidden rounded-full bg-carril"
              role="img"
              aria-label={TIPOS_EVENTO.map((t) => `${ESTILO_EVENTO[t].plural}: ${resumen.por_tipo[t]}`).join(", ")}
            >
              {TIPOS_EVENTO.filter((t) => resumen.por_tipo[t] > 0).map((t) => (
                <span
                  key={t}
                  className={ESTILO_EVENTO[t].punto}
                  style={{ width: `${(resumen.por_tipo[t] / resumen.total) * 100}%` }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <TarjetaBarras
        titulo="Día con más eventos"
        ganador={diaGanador ? DIAS_SEMANA[diaGanador - 1] : null}
        barras={patrones.por_dia.map((cantidad, i) => ({
          clave: DIAS_SEMANA[i],
          etiqueta: DIAS_SEMANA_CORTO[i],
          cantidad,
          destacada: diaGanador === i + 1,
        }))}
      />
      <TarjetaBarras
        titulo="Franja con más eventos"
        ganador={FRANJAS.find((f) => f.valor === franjaGanadora)?.nombre ?? null}
        barras={FRANJAS.map((f) => ({
          clave: `${f.nombre} (${f.horas})`,
          etiqueta: f.nombre,
          cantidad: patrones.por_franja[f.valor],
          destacada: franjaGanadora === f.valor,
        }))}
      />
    </section>
  )
}

function TarjetaBarras({
  titulo,
  ganador,
  barras,
}: {
  titulo: string
  ganador: string | null
  barras: { clave: string; etiqueta: string; cantidad: number; destacada: boolean }[]
}) {
  const maximo = Math.max(...barras.map((b) => b.cantidad), 1)
  return (
    <div className={CLASE_TARJETA}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-cuerpo font-medium text-muted-foreground">{titulo}</p>
        {ganador && <p className="text-subtitulo-grande">{ganador}</p>}
      </div>
      <ul className="mt-4 flex items-end justify-between gap-2">
        {barras.map((b) => (
          <li key={b.clave} className="flex flex-1 flex-col items-center gap-2" title={`${b.clave}: ${b.cantidad}`}>
            <span
              className={cn("w-full max-w-10 rounded-md", b.destacada ? "bg-primary" : "bg-carril")}
              style={{ height: `${Math.max((b.cantidad / maximo) * ALTO_BARRAS_REM, 0.5)}rem` }}
              aria-hidden="true"
            />
            <span className="text-cuerpo-pequeno text-muted-foreground">{b.etiqueta}</span>
            <span className="sr-only">
              {b.clave}: {b.cantidad} {b.cantidad === 1 ? "evento" : "eventos"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function AvisoSinPatron({ total, minimo }: { total: number; minimo: number }) {
  return (
    <section
      className="flex flex-wrap items-center gap-x-5 gap-y-4 rounded-xl border border-dashed border-borde-fuerte bg-muted p-5"
      aria-label="Patrones de los eventos"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
        <Info className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-60 flex-1">
        <p className="text-subtitulo-grande">Todavía no hay suficientes eventos para detectar un patrón</p>
        <p className="mt-1 text-cuerpo text-muted-foreground">
          Cuando el conductor acumule más eventos, aquí verás su tipo más frecuente, el día y la franja horaria con más
          riesgo.
        </p>
      </div>
      <div className="w-full sm:w-64">
        <p className="text-right text-subtitulo">
          {formatearEntero(total)} de {formatearEntero(minimo)} eventos
        </p>
        <div
          className="mt-2 h-2 overflow-hidden rounded-full bg-carril"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={minimo}
          aria-valuenow={Math.min(total, minimo)}
        >
          <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min((total / minimo) * 100, 100)}%` }} />
        </div>
      </div>
    </section>
  )
}
