import { useState } from "react"
import { Check, Copy, TriangleAlert } from "lucide-react"

import { Button } from "@/components/ui/button"
import { DialogFooter } from "@/components/ui/dialog"

/** Contraseña temporal recién generada: se muestra una sola vez y se puede copiar. */
export function CredencialTemporal({
  nombre,
  email,
  contrasenia,
  alTerminar,
}: {
  nombre: string
  email: string
  contrasenia: string
  alTerminar: () => void
}) {
  const [copiada, setCopiada] = useState(false)
  const [errorCopiar, setErrorCopiar] = useState(false)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(contrasenia)
      setCopiada(true)
      setErrorCopiar(false)
      setTimeout(() => setCopiada(false), 2500)
    } catch {
      setErrorCopiar(true)
    }
  }

  return (
    <>
      <dl className="flex flex-col gap-4 rounded-lg border border-border bg-muted p-4">
        <div>
          <dt className="text-etiqueta text-muted-foreground uppercase">Conductor</dt>
          <dd className="text-subtitulo">{nombre}</dd>
          <dd className="text-cuerpo-pequeno break-all text-muted-foreground">{email}</dd>
        </div>
        <div>
          <dt className="text-etiqueta text-muted-foreground uppercase">Contraseña temporal</dt>
          <dd className="mt-1 flex flex-wrap items-center gap-3">
            <code className="rounded-md border border-border bg-card px-3 py-2 font-numeros text-subtitulo-grande tracking-wider select-all">
              {contrasenia}
            </code>
            <Button variant="outline" size="sm" onClick={copiar}>
              {copiada ? <Check /> : <Copy />}
              {copiada ? "Copiada" : "Copiar"}
            </Button>
          </dd>
          {errorCopiar && (
            <dd className="mt-2 text-cuerpo-pequeno text-destructive">
              No se pudo copiar. Selecciona la contraseña y cópiala a mano.
            </dd>
          )}
        </div>
      </dl>
      <p className="flex items-start gap-3 rounded-lg border border-advertencia/30 bg-tinte-advertencia px-4 py-3 text-cuerpo-pequeno font-medium text-texto-evento-giro">
        <TriangleAlert className="mt-px size-5 shrink-0" aria-hidden="true" />
        Se muestra solo ahora y no se podrá ver de nuevo. Entrégasela al conductor; si la pierdes, genera una
        nueva.
      </p>
      <DialogFooter>
        <Button onClick={alTerminar}>Listo</Button>
      </DialogFooter>
    </>
  )
}
