import { LogOut } from "lucide-react"
import { useNavigate } from "react-router"

import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { useSesion } from "@/features/auth/session-context"

/** Panel provisional: se reemplaza al implementar las historias del panel (HU-24 en adelante). */
export function PanelProvisionalPagina() {
  const { usuario, cerrarSesion } = useSesion()
  const navegar = useNavigate()

  const salir = () => {
    cerrarSesion()
    navegar("/", { replace: true })
  }

  return (
    <div className="min-h-svh bg-background">
      <title>Panel · DriveSense</title>
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex h-18 max-w-contenido items-center justify-between gap-6 px-8 xl:px-16">
          <Logo sobreClaro />
          <div className="flex items-center gap-4">
            {usuario?.empresa && (
              <span className="text-cuerpo font-semibold text-foreground">{usuario.empresa.nombre}</span>
            )}
            <Button variant="outline" onClick={salir}>
              <LogOut aria-hidden="true" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-contenido px-8 py-10 xl:px-16">
        <h1 className="text-titulo">Hola, {usuario?.nombre}</h1>
      </main>
    </div>
  )
}
