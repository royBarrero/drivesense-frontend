import {
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  CornerUpLeft,
  CornerUpRight,
  Flag,
  RotateCw,
  Volume2,
  VolumeX,
  type LucideIcon,
} from "lucide-react"

import { formatearDecimal } from "@/lib/format"

import { proximaManiobra, titulo, type PasoDemo, type TipoPasoDemo } from "./copilot"

const ICONO_PASO: Record<TipoPasoDemo, LucideIcon> = {
  girar_izquierda: CornerUpLeft,
  girar_derecha: CornerUpRight,
  girar_leve_izquierda: ArrowUpLeft,
  girar_leve_derecha: ArrowUpRight,
  mantener_izquierda: ArrowUpLeft,
  mantener_derecha: ArrowUpRight,
  entrar_rotonda: RotateCw,
  salir_rotonda: ArrowUpRight,
  seguir_recto: ArrowUp,
}

/** "850 m" / "1,2 km". */
function formatearDistancia(metros: number) {
  return metros >= 1000 ? `${formatearDecimal(metros / 1000)} km` : `${Math.max(0, Math.round(metros / 10) * 10)} m`
}

/** Próxima indicación del Copiloto y el botón para activar o desactivar la voz. */
export function TarjetaCopiloto({
  pasos,
  largoM,
  recorridoM,
  enCurso,
  llego,
  voz,
  alCambiarVoz,
  vozDisponible,
}: {
  pasos: PasoDemo[]
  largoM: number
  /** Nulo antes de iniciar. */
  recorridoM: number | null
  enCurso: boolean
  llego: boolean
  voz: boolean
  alCambiarVoz: (activa: boolean) => void
  vozDisponible: boolean
}) {
  const proxima = recorridoM === null ? null : proximaManiobra(pasos, recorridoM)
  const Icono = llego || (recorridoM !== null && !proxima) ? Flag : proxima ? ICONO_PASO[proxima.paso.tipo] : ArrowUp
  const VozIcono = voz ? Volume2 : VolumeX

  let principal: string
  let secundario: string
  if (llego) {
    principal = "Llegaste a tu destino"
    secundario = "Termina el viaje para guardarlo"
  } else if (recorridoM === null || !enCurso) {
    principal = "Copiloto por voz"
    secundario = "Te irá indicando la ruta al iniciar el viaje"
  } else if (proxima) {
    principal = titulo(proxima.paso)
    secundario = [formatearDistancia(proxima.distanciaM), proxima.paso.calle].filter(Boolean).join(" · ")
  } else {
    principal = "Sigue hasta el destino"
    secundario = formatearDistancia(largoM - recorridoM)
  }

  return (
    <section
      className="flex items-center gap-4 rounded-xl bg-encabezado-fondo p-5 shadow-tarjeta"
      aria-label="Copiloto"
      aria-live="polite"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-encabezado-superficie text-encabezado-acento">
        <Icono className="size-7" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-subtitulo-grande text-encabezado-texto">{principal}</p>
        <p className="mt-0.5 text-cuerpo text-encabezado-texto-secundario">{secundario}</p>
      </div>
      <button
        type="button"
        onClick={() => alCambiarVoz(!voz)}
        disabled={!vozDisponible}
        aria-pressed={voz}
        title={vozDisponible ? (voz ? "Silenciar la voz" : "Activar la voz") : "Este navegador no tiene voz"}
        className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-encabezado-borde px-3 text-cuerpo-pequeno font-semibold text-encabezado-texto hover:bg-encabezado-superficie focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none disabled:opacity-50"
      >
        <VozIcono className="size-4" aria-hidden="true" />
        {voz ? "Voz activada" : "Voz desactivada"}
      </button>
    </section>
  )
}
