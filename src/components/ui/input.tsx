import * as React from "react"
import { cn } from "@/lib/utils"

// Tema de DriveSense: docs/diseno.md, sección 6.2 (igual que los campos de la app)
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-13 w-full min-w-0 rounded-lg border border-input bg-muted px-4 text-cuerpo text-foreground transition-colors outline-none placeholder:text-texto-terciario focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-60 aria-invalid:border-peligro aria-invalid:ring-peligro/15 aria-invalid:focus-visible:ring-3",
        className
      )}
      {...props}
    />
  )
}

export { Input }
