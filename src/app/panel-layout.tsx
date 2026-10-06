import { useState, type ReactNode } from "react"
import { BarChart3, FlaskConical, House, LogOut, Menu, Users, type LucideIcon } from "lucide-react"
import { NavLink, Outlet, useNavigate } from "react-router"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useSesion } from "@/features/auth/session-context"
import { useAccesoPruebas } from "@/features/pruebas/access-context"
import { iniciales } from "@/lib/format"
import { cn } from "@/lib/utils"

/** Panel con menú lateral oscuro (docs/diseno.md, 8.6). Bajo 1024 px el menú va en un Sheet. */
export function PanelLayout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="min-h-svh bg-background lg:flex">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 lg:block">
        <MenuLateral />
      </aside>

      {/* Barra superior en pantallas angostas */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between bg-encabezado-fondo px-4 lg:hidden">
        <Logo />
        <Button
          variant="contornoOscuro"
          size="icon"
          onClick={() => setMenuAbierto(true)}
          aria-label="Abrir el menú"
        >
          <Menu />
        </Button>
      </header>
      <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
        <SheetContent side="left" className="w-64 border-none p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Menú</SheetTitle>
          <SheetDescription className="sr-only">Secciones del panel</SheetDescription>
          <MenuLateral alNavegar={() => setMenuAbierto(false)} />
        </SheetContent>
      </Sheet>

      <main className="min-w-0 flex-1 px-6 py-8 lg:px-8 lg:py-10 2xl:px-12">
        <div className="mx-auto max-w-contenido">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function MenuLateral({ alNavegar }: { alNavegar?: () => void }) {
  const { usuario, cerrarSesion } = useSesion()
  const acceso = useAccesoPruebas()
  const navegar = useNavigate()

  const salir = () => {
    cerrarSesion()
    navegar("/", { replace: true })
  }

  return (
    <nav className="flex h-full flex-col gap-8 bg-encabezado-fondo px-4 py-6" aria-label="Secciones del panel">
      <div className="px-2">
        <Logo />
      </div>

      <GrupoMenu titulo="General">
        <ItemMenu a="/panel" icono={House} alNavegar={alNavegar} exacto>
          Inicio
        </ItemMenu>
        <ItemProximo icono={Users}>Conductores</ItemProximo>
        <ItemProximo icono={BarChart3}>Reportes</ItemProximo>
      </GrupoMenu>

      {/* Temporal: modo pruebas */}
      {acceso && (
        <GrupoMenu titulo="Herramientas">
          <ItemMenu a="/panel/pruebas" icono={FlaskConical} alNavegar={alNavegar}>
            Pruebas
            <span className="ml-auto rounded-full bg-advertencia/15 px-2 py-0.5 text-ayuda font-semibold text-advertencia">
              Temporal
            </span>
          </ItemMenu>
        </GrupoMenu>
      )}

      <div className="mt-auto flex items-center gap-3 rounded-xl bg-encabezado-superficie p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-encabezado-borde text-cuerpo-pequeno font-semibold text-encabezado-acento">
          {iniciales(usuario?.nombre ?? "")}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-subtitulo text-encabezado-texto">{usuario?.nombre}</span>
          <span className="block truncate text-cuerpo-pequeno text-encabezado-texto-secundario">
            {acceso ? "Superadmin" : "Administrador"}
          </span>
        </span>
        <Button
          variant="contornoOscuro"
          size="icon"
          className="size-9 border-none"
          onClick={salir}
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          <LogOut />
        </Button>
      </div>
    </nav>
  )
}

function GrupoMenu({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="px-3 pb-2 text-etiqueta text-encabezado-texto-secundario uppercase">{titulo}</p>
      {children}
    </div>
  )
}

const CLASE_ITEM = "flex h-12 items-center gap-3 rounded-lg px-3 text-subtitulo"

function ItemMenu({
  a,
  icono: Icono,
  exacto = false,
  alNavegar,
  children,
}: {
  a: string
  icono: LucideIcon
  exacto?: boolean
  alNavegar?: () => void
  children: ReactNode
}) {
  return (
    <NavLink
      to={a}
      end={exacto}
      onClick={alNavegar}
      className={({ isActive }) =>
        cn(
          CLASE_ITEM,
          "group transition-colors",
          isActive
            ? "bg-encabezado-borde text-encabezado-texto"
            : "text-encabezado-texto-secundario hover:bg-encabezado-borde/40 hover:text-encabezado-texto",
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icono className={cn("size-5", isActive && "text-encabezado-acento")} aria-hidden="true" />
          {children}
        </>
      )}
    </NavLink>
  )
}

function ItemProximo({ icono: Icono, children }: { icono: LucideIcon; children: ReactNode }) {
  return (
    <span className={cn(CLASE_ITEM, "cursor-default text-encabezado-texto-secundario/60")} aria-disabled="true">
      <Icono className="size-5" aria-hidden="true" />
      {children}
      <span className="ml-auto rounded-full bg-encabezado-superficie px-2 py-0.5 text-ayuda text-encabezado-texto-secundario">
        Pronto
      </span>
    </span>
  )
}
