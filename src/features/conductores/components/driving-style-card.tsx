import { ArrowRight, TrendingDown, TrendingUp, TriangleAlert } from "lucide-react"

import { CapsulaIA } from "@/components/ai-badge"
import { formatearDecimal, formatearDia } from "@/lib/format"
import { cn } from "@/lib/utils"

import { textoAlerta } from "../driving-style"
import type { EstiloPerfil } from "../types"
import { DistintivoEstilo } from "./driving-style-badge"
import { DistintivoRiesgo } from "./risk-badge"

// Mismo umbral que el backend usa para "a la baja" (−0,5 puntos por viaje), hacia arriba
const PENDIENTE_MEJORA = 0.5

/**
 * Estilo de conducción del conductor (HU-25): lo calcula el backend con K-means sobre los
 * últimos 30 días, así que no cambia con el periodo elegido.
 */
export function TarjetaEstilo({ estilo }: { estilo: EstiloPerfil }) {
  const sinDatos = estilo.estilo === "sin_datos"

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta" aria-labelledby="titulo-estilo">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="titulo-estilo" className="text-subtitulo-grande">
          Estilo de conducción
        </h2>
        <CapsulaIA titulo="Calculado por la IA del sistema comparando los viajes de muchos conductores" />
      </div>
      <p className="mt-1 text-cuerpo text-muted-foreground">
        Con los viajes de los últimos 30 días, sin importar el periodo elegido.
      </p>

      <div className="mt-4 grid gap-5 lg:grid-cols-[3fr_2fr]">
        <div>
          {sinDatos ? (
            <div className="rounded-lg border border-dashed border-borde-fuerte bg-muted p-4">
              <DistintivoEstilo estilo="sin_datos" />
              <p className="mt-3 text-cuerpo">Todavía no hay datos suficientes para definir su estilo.</p>
              {estilo.explicacion.map((frase) => (
                <p key={frase} className="mt-1 text-cuerpo text-muted-foreground">
                  {frase}.
                </p>
              ))}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <DistintivoEstilo estilo={estilo.estilo} className="px-4 py-2 text-subtitulo" />
                <span className="text-cuerpo text-muted-foreground">
                  Según {estilo.viajes} {estilo.viajes === 1 ? "viaje" : "viajes"}
                </span>
              </div>
              {estilo.alerta && (
                <p className="mt-4 flex items-start gap-2 rounded-lg border border-borde-peligro-suave bg-tinte-peligro px-3 py-2 text-cuerpo text-destructive">
                  <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <span>
                    <span className="font-semibold">{textoAlerta(estilo.alerta.anterior, estilo.alerta.actual)}</span>{" "}
                    ({formatearDia(estilo.alerta.fecha)}).
                  </span>
                </p>
              )}
              <h3 className="mt-4 text-etiqueta font-medium text-muted-foreground uppercase">Por qué</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {estilo.explicacion.map((frase) => (
                  <li key={frase} className="flex gap-2 text-cuerpo">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-borde-fuerte" aria-hidden="true" />
                    {frase}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <Tendencia estilo={estilo} />
      </div>
    </section>
  )
}

function Tendencia({ estilo }: { estilo: EstiloPerfil }) {
  const { pendiente, proyectado, riesgo } = estilo

  return (
    <div className="rounded-lg bg-muted p-4">
      <h3 className="text-etiqueta font-medium text-muted-foreground uppercase">Tendencia de riesgo</h3>
      {pendiente === null || proyectado === null ? (
        <p className="mt-2 text-cuerpo text-muted-foreground">
          Todavía no hay suficientes viajes para calcular la tendencia.
        </p>
      ) : (
        <>
          <TextoTendencia estilo={estilo} />
          <p className="mt-1 text-cuerpo-pequeno text-muted-foreground">
            {pendiente > 0 ? "+" : ""}
            {formatearDecimal(pendiente)} {Math.abs(pendiente) === 1 ? "punto" : "puntos"} de DriveScore por viaje en
            sus últimos {estilo.viajes_tendencia} viajes.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <span className="text-cuerpo">
              Próximo viaje estimado:{" "}
              <span className="font-numeros font-bold tabular-nums">{proyectado}</span>
            </span>
            {riesgo && <DistintivoRiesgo nivel={riesgo} />}
          </div>
        </>
      )}
    </div>
  )
}

function TextoTendencia({ estilo }: { estilo: EstiloPerfil }) {
  const pendiente = estilo.pendiente ?? 0
  const [Icono, texto, color] = estilo.tendencia_a_la_baja
    ? [TrendingDown, "Viene empeorando", "text-destructive"]
    : pendiente >= PENDIENTE_MEJORA
      ? [TrendingUp, "Viene mejorando", "text-texto-exito"]
      : [ArrowRight, "Estable", "text-muted-foreground"]
  return (
    <p className={cn("mt-2 flex items-center gap-2 text-subtitulo", color)}>
      <Icono className="size-5" aria-hidden="true" />
      {texto}
    </p>
  )
}
