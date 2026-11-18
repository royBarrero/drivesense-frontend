import { useEffect, useRef, useState } from "react"

import { formatearDiaMes, formatearHora } from "@/lib/format"

import type { Agrupacion, PuntoEvolucion } from "@/features/conductores/types"

const ALTO = 240
const MARGEN = { izquierda: 40, derecha: 12, arriba: 16, abajo: 34 }
// El primer y el último punto no se pegan al borde de la gráfica
const RELLENO = 10
// Cortes de la calificación (Regular, Muy bueno, Excelente)
const REFERENCIAS = [60, 75, 90]
// Si el primer y el último punto quedan más cerca que esto, solo se rotula el primero
const SEPARACION_MINIMA_FECHAS = 96

function etiqueta(punto: PuntoEvolucion, agrupacion: Agrupacion) {
  const cuando =
    agrupacion === "viaje"
      ? `${formatearDiaMes(punto.fecha)} ${formatearHora(punto.fecha)}`
      : agrupacion === "dia"
        ? formatearDiaMes(punto.fecha)
        : `Semana del ${formatearDiaMes(punto.fecha)}`
  const viajes = punto.viajes === 1 ? "1 viaje" : `${punto.viajes} viajes`
  return `${cuando} · DriveScore ${punto.drivescore} · ${viajes}`
}

/** Ancho real del contenedor: la gráfica se dibuja a ese tamaño para que el texto no se encoja. */
function useAncho() {
  const ref = useRef<HTMLDivElement>(null)
  const [ancho, setAncho] = useState(0)
  useEffect(() => {
    const contenedor = ref.current
    if (!contenedor) return
    // Avisa al observar por primera vez y en cada cambio de tamaño
    const observador = new ResizeObserver(([entrada]) => setAncho(Math.round(entrada.contentRect.width)))
    observador.observe(contenedor)
    return () => observador.disconnect()
  }, [])
  return [ref, ancho] as const
}

/** Evolución del DriveScore: un punto por viaje, día o semana según el periodo. */
export function GraficoEvolucion({ puntos, agrupacion }: { puntos: PuntoEvolucion[]; agrupacion: Agrupacion }) {
  const [ref, ancho] = useAncho()

  return (
    <div ref={ref} className="h-60 w-full">
      {ancho > 0 && <Grafico puntos={puntos} agrupacion={agrupacion} ancho={ancho} />}
    </div>
  )
}

function Grafico({
  puntos,
  agrupacion,
  ancho,
}: {
  puntos: PuntoEvolucion[]
  agrupacion: Agrupacion
  ancho: number
}) {
  const izquierda = MARGEN.izquierda + RELLENO
  const anchoUtil = Math.max(ancho - izquierda - MARGEN.derecha - RELLENO, 1)
  const altoUtil = ALTO - MARGEN.arriba - MARGEN.abajo
  const tiempos = puntos.map((p) => new Date(p.fecha).getTime())
  const primero = Math.min(...tiempos)
  const ultimo = Math.max(...tiempos)

  const x = (tiempo: number) =>
    izquierda + (ultimo === primero ? anchoUtil / 2 : ((tiempo - primero) / (ultimo - primero)) * anchoUtil)
  const y = (valor: number) => MARGEN.arriba + (1 - valor / 100) * altoUtil

  const coordenadas = puntos.map((p, i) => ({ x: x(tiempos[i]), y: y(p.drivescore), punto: p }))
  const trazo = coordenadas.map((c) => `${c.x},${c.y}`).join(" ")
  const inicio = coordenadas[0]
  const fin = coordenadas[coordenadas.length - 1]
  const conDosFechas = coordenadas.length > 1 && fin.x - inicio.x >= SEPARACION_MINIMA_FECHAS

  const resumen = `Evolución del DriveScore: ${puntos.length} ${puntos.length === 1 ? "punto" : "puntos"}, del ${formatearDiaMes(puntos[0].fecha)} al ${formatearDiaMes(puntos[puntos.length - 1].fecha)}`

  return (
    <svg width={ancho} height={ALTO} viewBox={`0 0 ${ancho} ${ALTO}`} role="img" aria-label={resumen}>
      {[0, ...REFERENCIAS, 100].map((valor) => (
        <g key={valor}>
          <line
            x1={MARGEN.izquierda}
            x2={ancho - MARGEN.derecha}
            y1={y(valor)}
            y2={y(valor)}
            className="stroke-border"
            strokeDasharray={valor === 0 || valor === 100 ? undefined : "4 4"}
          />
          <text
            x={MARGEN.izquierda - 8}
            y={y(valor)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-foreground font-numeros text-cuerpo-pequeno tabular-nums"
          >
            {valor}
          </text>
        </g>
      ))}
      {coordenadas.length > 1 && (
        <polyline
          points={trazo}
          fill="none"
          className="stroke-primario"
          strokeWidth={3}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      )}
      {coordenadas.map((c) => (
        <circle key={c.punto.fecha} cx={c.x} cy={c.y} r={5} className="fill-card stroke-primario" strokeWidth={3}>
          <title>{etiqueta(c.punto, agrupacion)}</title>
        </circle>
      ))}
      <text
        x={conDosFechas ? inicio.x : (inicio.x + fin.x) / 2}
        y={ALTO - 8}
        textAnchor={conDosFechas ? "start" : "middle"}
        className="fill-muted-foreground text-cuerpo-pequeno"
      >
        {formatearDiaMes(puntos[0].fecha)}
      </text>
      {conDosFechas && (
        <text x={fin.x} y={ALTO - 8} textAnchor="end" className="fill-muted-foreground text-cuerpo-pequeno">
          {formatearDiaMes(puntos[puntos.length - 1].fecha)}
        </text>
      )}
    </svg>
  )
}
