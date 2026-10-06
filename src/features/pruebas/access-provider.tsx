import { useEffect, useState, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { Navigate } from "react-router"

import { tieneAcceso } from "./api"
import { ContextoAccesoPruebas, useAccesoPruebas } from "./access-context"

/**
 * Modo pruebas (temporal): pregunta una vez si la sesión es la cuenta de pruebas
 * (`GET /pruebas/acceso`). Si falla por otra razón (sin conexión), se oculta.
 */
export function AccesoPruebasProvider({ children }: { children: ReactNode }) {
  const [acceso, setAcceso] = useState<boolean | null>(null)

  useEffect(() => {
    let vigente = true
    tieneAcceso()
      .then((valor) => vigente && setAcceso(valor))
      .catch(() => vigente && setAcceso(false))
    return () => {
      vigente = false
    }
  }, [])

  return <ContextoAccesoPruebas.Provider value={acceso}>{children}</ContextoAccesoPruebas.Provider>
}

/** Rutas de pruebas: sin acceso, de vuelta a Inicio. */
export function RutaPruebas({ children }: { children: ReactNode }) {
  const acceso = useAccesoPruebas()
  if (acceso === null) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="size-8 animate-spin text-primary" aria-label="Cargando" />
      </div>
    )
  }
  if (!acceso) return <Navigate to="/panel" replace />
  return children
}
