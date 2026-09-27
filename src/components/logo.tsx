import { cn } from "@/lib/utils"

interface Props {
  /** Nombre en color oscuro, para fondos claros. */
  sobreClaro?: boolean
  /** Oculta "DriveSense" por debajo de 640 px (barras angostas de móvil). */
  nombreSoloDesdeSm?: boolean
  className?: string
}

/** Caja del logo con el velocímetro en trazo + "DriveSense" (docs/diseno.md, 8.1). */
export function Logo({ sobreClaro = false, nombreSoloDesdeSm = false, className }: Props) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="flex size-11 items-center justify-center rounded-logo border border-encabezado-borde bg-encabezado-superficie">
        <Velocimetro className="size-6 stroke-encabezado-acento" />
      </span>
      <span
        className={cn(
          "text-marca",
          sobreClaro ? "text-foreground" : "text-encabezado-texto",
          nombreSoloDesdeSm && "hidden sm:inline",
        )}
      >
        DriveSense
      </span>
    </span>
  )
}

/** Arco de 240° con aguja, en trazo (el mismo dibujo que en la app). */
function Velocimetro({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden="true">
      {/* Arco de radio 9 con centro en (12, 13): de 150° a 30° pasando por arriba */}
      <path d="M4.2 17.5A9 9 0 1 1 19.8 17.5" />
      <path d="M12 13l3.9-4.6" />
      <circle cx="12" cy="13" r="1.2" className="fill-encabezado-acento" stroke="none" />
    </svg>
  )
}
