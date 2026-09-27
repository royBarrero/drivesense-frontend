import { CircleAlert } from "lucide-react"

/** Aviso de error arriba de un formulario (docs/diseno.md, 6.2). */
export function AvisoError({ mensaje }: { mensaje: string }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-borde-peligro-suave bg-tinte-peligro p-3 text-cuerpo-pequeno text-destructive"
    >
      <CircleAlert className="mt-px size-5 shrink-0" aria-hidden="true" />
      <p>{mensaje}</p>
    </div>
  )
}
