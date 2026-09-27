import { useState, type ComponentProps } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export function CampoContrasenia({ className, ...props }: Omit<ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input type={visible ? "text" : "password"} className={cn("pr-13", className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
        // Fuera del orden de tabulación: Tab va de un campo al siguiente
        tabIndex={-1}
        className="absolute top-1/2 right-1 flex size-11 -translate-y-1/2 items-center justify-center rounded-full text-texto-terciario hover:text-foreground"
      >
        {visible ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
      </button>
    </div>
  )
}
