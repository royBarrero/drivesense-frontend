import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

// Tema de DriveSense: docs/diseno.md, sección 6.1
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none aria-busy:pointer-events-none aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-boton-primario hover:bg-primario-presionado disabled:bg-secondary disabled:text-muted-foreground disabled:shadow-none",
        outline:
          "border-border bg-card text-foreground hover:bg-muted aria-expanded:bg-muted disabled:opacity-50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] disabled:opacity-50",
        ghost: "text-foreground hover:bg-muted aria-expanded:bg-muted disabled:opacity-50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 disabled:opacity-50",
        link: "text-enlace underline-offset-4 hover:underline disabled:opacity-50",
        // Sobre el encabezado oscuro
        sobreOscuro:
          "bg-encabezado-acento text-encabezado-superficie hover:bg-encabezado-acento/90 disabled:opacity-50",
        contornoOscuro:
          "border-encabezado-borde bg-transparent text-encabezado-texto hover:bg-encabezado-borde/40 aria-expanded:bg-encabezado-borde/40 disabled:opacity-50",
      },
      size: {
        sm: "h-9 px-4 text-cuerpo font-semibold",
        default: "h-11 px-6 text-cuerpo font-semibold",
        lg: "h-12 px-6 text-boton",
        formulario: "h-13.5 px-6 text-boton",
        link: "min-h-11 px-1 text-cuerpo font-semibold",
        icon: "size-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
