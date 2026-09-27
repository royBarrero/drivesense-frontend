import type { ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { Navigate } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { useSesion } from "@/features/auth/session-context"

/** Solo con sesión válida (comprobada con GET /auth/yo). */
export function RutaProtegida({ children }: { children: ReactNode }) {
  const { estado, error, reintentar } = useSesion()

  if (estado === "sinSesion") return <Navigate to="/" replace />
  if (estado === "autenticado") return children

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6">
      {estado === "comprobando" ? (
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Comprobando la sesión" />
      ) : (
        // Sin conexión u otro error: se conserva el token y se ofrece reintentar
        <div className="flex w-full max-w-sm flex-col gap-4">
          <AvisoError mensaje={error ?? ""} />
          <Button onClick={reintentar}>Reintentar</Button>
        </div>
      )}
    </div>
  )
}

/** Landing y registro: con sesión guardada se va directo al panel. */
export function SoloSinSesion({ children }: { children: ReactNode }) {
  const { estado } = useSesion()
  if (estado !== "sinSesion") return <Navigate to="/panel" replace />
  return children
}
