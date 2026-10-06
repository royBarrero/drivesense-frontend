import { iniciales } from "@/lib/format"
import { cn } from "@/lib/utils"

// Cada tester con un tinte fijo según su id, para reconocerlo entre filas
const COLORES = [
  "bg-tinte-primario text-texto-exito",
  "bg-tinte-confort text-texto-evento-aceleracion",
  "bg-tinte-peligro text-texto-evento-frenada",
  "bg-tinte-secundario text-texto-evento-velocidad",
  "bg-tinte-advertencia text-texto-evento-giro",
]

export function AvatarTester({ id, nombre, grande = false }: { id: number; nombre: string; grande?: boolean }) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-semibold",
        grande ? "size-14 text-subtitulo" : "size-10 text-cuerpo-pequeno",
        COLORES[id % COLORES.length],
      )}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  )
}

