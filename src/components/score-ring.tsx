import { useEffect, useId, useState } from "react"

import { cn } from "@/lib/utils"

const TAMANIO = 176
const TRAZO = 12
const RADIO = (TAMANIO - TRAZO) / 2
const CIRCUNFERENCIA = 2 * Math.PI * RADIO

/**
 * Anillo del DriveScore (docs/diseno.md, 6.5): trazo de 12 px con el degradado esmeralda → cian
 * sobre un carril. Se llena al aparecer (sin animación con `prefers-reduced-motion`).
 * `sobreOscuro` usa el carril y el texto de los bloques oscuros.
 */
export function AnilloDriveScore({
  drivescore,
  etiqueta,
  sobreOscuro = false,
  className,
}: {
  drivescore: number | null
  etiqueta: string
  sobreOscuro?: boolean
  className?: string
}) {
  const idDegradado = useId()
  const [lleno, setLleno] = useState(false)
  useEffect(() => {
    const marco = requestAnimationFrame(() => setLleno(true))
    return () => cancelAnimationFrame(marco)
  }, [])

  const fraccion = drivescore === null ? 0 : Math.min(Math.max(drivescore, 0), 100) / 100
  const desplazamiento = CIRCUNFERENCIA * (1 - (lleno ? fraccion : 0))

  return (
    <div
      className={cn("relative size-44", className)}
      role="img"
      aria-label={drivescore === null ? `${etiqueta}: sin datos` : `${etiqueta}: ${drivescore} de 100`}
    >
      <svg viewBox={`0 0 ${TAMANIO} ${TAMANIO}`} className="size-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={idDegradado} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--ds-primario)" />
            <stop offset="1" stopColor="var(--ds-gradiente-score-fin)" />
          </linearGradient>
        </defs>
        <circle
          cx={TAMANIO / 2}
          cy={TAMANIO / 2}
          r={RADIO}
          fill="none"
          strokeWidth={TRAZO}
          className={sobreOscuro ? "stroke-encabezado-borde" : "stroke-carril"}
        />
        <circle
          cx={TAMANIO / 2}
          cy={TAMANIO / 2}
          r={RADIO}
          fill="none"
          strokeWidth={TRAZO}
          strokeLinecap="round"
          stroke={`url(#${idDegradado})`}
          strokeDasharray={CIRCUNFERENCIA}
          strokeDashoffset={desplazamiento}
          className="transition-[stroke-dashoffset] duration-1000 ease-out motion-reduce:transition-none"
          opacity={drivescore === null ? 0 : 1}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-numeros text-telemetria tabular-nums",
            sobreOscuro ? "text-encabezado-texto" : "text-foreground",
            drivescore === null && "text-texto-terciario",
          )}
        >
          {drivescore ?? "—"}
        </span>
        <span
          className={cn(
            "mt-1 text-etiqueta uppercase",
            sobreOscuro ? "text-encabezado-texto-secundario" : "text-muted-foreground",
          )}
        >
          {etiqueta}
        </span>
      </div>
    </div>
  )
}
