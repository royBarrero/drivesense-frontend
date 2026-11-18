import { useState } from "react"
import { Loader2 } from "lucide-react"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ErrorApi } from "@/lib/api-client"

import { generarContraseniaTemporal } from "../api"
import type { ConductorFlota } from "../types"
import { CredencialTemporal } from "./temporary-credential"

/** Confirma y genera una nueva contraseña temporal para un conductor. */
export function DialogoNuevaContrasenia({
  conductor,
  alCerrar,
}: {
  conductor: ConductorFlota | null
  alCerrar: () => void
}) {
  return (
    <Dialog open={conductor !== null} onOpenChange={(abrir) => !abrir && alCerrar()}>
      {/* `key`: al elegir otro conductor se reinicia el estado del diálogo */}
      <ContenidoNuevaContrasenia key={conductor?.id} conductor={conductor} alCerrar={alCerrar} />
    </Dialog>
  )
}

function ContenidoNuevaContrasenia({
  conductor,
  alCerrar,
}: {
  conductor: ConductorFlota | null
  alCerrar: () => void
}) {
  const [contrasenia, setContrasenia] = useState<string | null>(null)
  const [generando, setGenerando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generar = async () => {
    if (!conductor) return
    setGenerando(true)
    setError(null)
    try {
      setContrasenia((await generarContraseniaTemporal(conductor.id)).contrasenia_temporal)
    } catch (e) {
      setError(e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO)
    } finally {
      setGenerando(false)
    }
  }

  return (
    <DialogContent
      onInteractOutside={(e) => contrasenia && e.preventDefault()}
      onEscapeKeyDown={(e) => contrasenia && e.preventDefault()}
      showCloseButton={!contrasenia}
    >
      {conductor && contrasenia ? (
        <>
          <DialogHeader>
            <DialogTitle>Nueva contraseña temporal</DialogTitle>
            <DialogDescription>La contraseña anterior ya no sirve.</DialogDescription>
          </DialogHeader>
          <CredencialTemporal
            nombre={conductor.nombre}
            email={conductor.email}
            contrasenia={contrasenia}
            alTerminar={alCerrar}
          />
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle>¿Generar una nueva contraseña?</DialogTitle>
            <DialogDescription>
              {conductor?.nombre} dejará de poder entrar con su contraseña actual. Verás la nueva una sola vez para
              entregársela.
            </DialogDescription>
          </DialogHeader>
          {error && <AvisoError mensaje={error} />}
          <DialogFooter>
            <Button variant="outline" onClick={alCerrar}>
              Cancelar
            </Button>
            <Button onClick={generar} aria-busy={generando}>
              {generando && <Loader2 className="animate-spin" aria-label="Generando" />}
              Generar contraseña
            </Button>
          </DialogFooter>
        </>
      )}
    </DialogContent>
  )
}
