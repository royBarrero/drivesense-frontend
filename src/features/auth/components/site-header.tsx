import { Menu } from "lucide-react"
import { Link } from "react-router"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const SECCIONES = [
  { id: "como-funciona", texto: "Cómo funciona" },
  { id: "para-flotas", texto: "Para flotas" },
  { id: "para-aseguradoras", texto: "Para aseguradoras" },
]

interface Props {
  /** Botón principal de la barra: en la landing registra, en el registro vuelve al login. */
  accion: "registrar" | "iniciarSesion"
}

/** Barra de navegación sobre el bloque oscuro (docs/diseno.md, 8). */
export function EncabezadoSitio({ accion }: Props) {
  // Desde /registro los enlaces vuelven a la landing y bajan a la sección
  const enlace = (id: string) => (accion === "registrar" ? `#${id}` : `/#${id}`)

  return (
    <header className="h-22 border-b border-encabezado-borde">
      <div className="mx-auto flex h-full max-w-contenido items-center justify-between gap-3 px-5 md:px-10 lg:px-16">
        <Link to="/" aria-label="DriveSense, inicio" className="rounded-lg">
          {/* En pantallas angostas solo cabe la caja del logo junto al botón y el menú */}
          <Logo nombreSoloDesdeSm />
        </Link>

        <nav aria-label="Secciones" className="hidden items-center gap-1 lg:flex">
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={enlace(s.id)}
              className="flex min-h-11 items-center rounded-full px-4 text-cuerpo text-encabezado-texto-secundario transition-colors hover:text-encabezado-texto"
            >
              {s.texto}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button asChild variant="contornoOscuro">
            {accion === "registrar" ? (
              <Link to="/registro">Registrar empresa</Link>
            ) : (
              <Link to="/">Iniciar sesión</Link>
            )}
          </Button>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="contornoOscuro" size="icon" className="lg:hidden" aria-label="Abrir menú">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="text-subtitulo">Menú</SheetTitle>
              </SheetHeader>
              <nav aria-label="Secciones" className="flex flex-col gap-1 px-2">
                {SECCIONES.map((s) => (
                  <a
                    key={s.id}
                    href={enlace(s.id)}
                    className="flex min-h-11 items-center rounded-lg px-3 text-cuerpo text-foreground hover:bg-muted"
                  >
                    {s.texto}
                  </a>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
