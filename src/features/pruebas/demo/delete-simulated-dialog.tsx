import { useState } from "react"
import { Loader2 } from "lucide-react"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ErrorApi } from "@/lib/api-client"

import { borrarRecorridosSimulados } from "../api"

interface Conductor {
  id: number
  nombre: string
}

/** Confirma y borra todos los viajes simulados del conductor. */
export function DialogoBorrarSimulados({
  conductor,
  alCerrar,
  alBorrar,
}: {
  conductor: Conductor | null
  alCerrar: () => void
  alBorrar: (borrados: number) => void
}) {
  return (
    <Dialog open={conductor !== null} onOpenChange={(abrir) => !abrir && alCerrar()}>
      {/* `key`: al elegir otro conductor se reinicia el estado del diálogo */}
      <Contenido key={conductor?.id} conductor={conductor} alCerrar={alCerrar} alBorrar={alBorrar} />
    </Dialog>
  )
}

function Contenido({
  conductor,
  alCerrar,
  alBorrar,
}: {
  conductor: Conductor | null
  alCerrar: () => void
  alBorrar: (borrados: number) => void
}) {
  const [borrando, setBorrando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const borrar = async () => {
    if (!conductor) return
    setBorrando(true)
    setError(null)
    try {
      alBorrar((await borrarRecorridosSimulados(conductor.id)).borrados)
    } catch (e) {
      setError(e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO)
    } finally {
      setBorrando(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>¿Borrar los viajes simulados?</DialogTitle>
        <DialogDescription>
          Se borrarán todos los viajes simulados de {conductor?.nombre}, con sus eventos y recomendaciones. Sus viajes
          reales no se tocan.
        </DialogDescription>
      </DialogHeader>
      {error && <AvisoError mensaje={error} />}
      <DialogFooter>
        <Button variant="outline" onClick={alCerrar}>
          Cancelar
        </Button>
        <Button variant="destructive" onClick={borrar} aria-busy={borrando}>
          {borrando && <Loader2 className="animate-spin" aria-label="Borrando" />}
          Borrar viajes simulados
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
