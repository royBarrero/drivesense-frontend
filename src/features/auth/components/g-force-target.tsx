import { cn } from "@/lib/utils"

interface Props {
  /** `completa`: círculos, ejes, ruta y punto sobre todo el bloque (escritorio).
   *  `reducida`: solo los círculos, pequeños, en la esquina (móvil y tablet). */
  variante: "completa" | "reducida"
  className?: string
}

/**
 * Diana de fuerzas G (docs/diseno.md, 8.3). Decorativa: los colores salen de las
 * clases del tema (`stroke-*`, `fill-*`), nunca en hex.
 */
export function DianaFuerzasG({ variante, className }: Props) {
  if (variante === "reducida") {
    return (
      <svg
        viewBox="0 0 200 200"
        // Debajo de la barra de navegación, para no quedar detrás de sus botones
        className={cn("absolute top-24 -right-14 size-50 stroke-encabezado-borde", className)}
        fill="none"
        strokeWidth="1"
      >
        <Circulos cx={100} cy={100} radios={[30, 58, 86]} largoEje={98} />
      </svg>
    )
  }

  // Coordenadas pensadas para 1440 × 640; `slice` recorta sin deformar en otros anchos
  const centro = { x: 880, y: 330 }
  return (
    <svg
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMid slice"
      className={cn("absolute inset-0 size-full", className)}
      fill="none"
    >
      <g className="stroke-encabezado-borde" strokeWidth="1">
        <Circulos cx={centro.x} cy={centro.y} radios={[60, 120, 180]} largoEje={210} />
      </g>
      {/* Ruta que cruza el bloque de izquierda a derecha pasando por el centro */}
      <path
        d={`M -20 622 C 380 626, 640 560, ${centro.x} ${centro.y} S 1260 90, 1460 60`}
        className="stroke-encabezado-acento"
        strokeWidth="2"
        strokeDasharray="6 7"
        strokeLinecap="round"
      />
      <circle
        cx={centro.x}
        cy={centro.y}
        r="6"
        className="fill-encabezado-acento drop-shadow-resplandor"
      />
    </svg>
  )
}

function Circulos({ cx, cy, radios, largoEje }: { cx: number; cy: number; radios: number[]; largoEje: number }) {
  const [interior, medio, exterior] = radios
  return (
    <>
      <circle cx={cx} cy={cy} r={interior} />
      <circle cx={cx} cy={cy} r={medio} strokeDasharray="4 5" />
      <circle cx={cx} cy={cy} r={exterior} />
      <line x1={cx - largoEje} y1={cy} x2={cx + largoEje} y2={cy} />
      <line x1={cx} y1={cy - largoEje} x2={cx} y2={cy + largoEje} />
    </>
  )
}
