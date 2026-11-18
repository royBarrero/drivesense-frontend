import { Lock } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Función que el plan no incluye: aparece bloqueada con una invitación a mejorarlo
 * (docs/diseno.md, 8.8). `compacto` es la versión en línea, sin tarjeta propia, para
 * diálogos.
 */
export function FuncionBloqueada({
  titulo,
  children,
  compacto = false,
  alNavegar,
  className,
}: {
  titulo: string
  children: React.ReactNode
  compacto?: boolean
  /** Se llama al pulsar "Mejorar plan" (p. ej. para cerrar un diálogo). */
  alNavegar?: () => void
  className?: string
}) {
  return (
    <section
      className={cn(
        "flex flex-col items-center rounded-xl border border-dashed border-borde-fuerte bg-muted px-5 text-center",
        compacto ? "py-8" : "py-12",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-tinte-advertencia text-texto-evento-giro">
        <Lock className="size-6" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-subtitulo-grande">{titulo}</h2>
      <p className="mt-1 max-w-md text-cuerpo text-muted-foreground">{children}</p>
      <Button asChild className="mt-5">
        <Link to="/panel/plan" onClick={alNavegar}>
          Mejorar plan
        </Link>
      </Button>
    </section>
  )
}
