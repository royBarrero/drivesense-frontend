import { useState } from "react"
import { Loader2 } from "lucide-react"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ErrorApi } from "@/lib/api-client"
import { formatearFechaCompleta } from "@/lib/format"

import { cambiarPlan } from "../api"
import { sumarMeses, textoHistorial, textoLimite, textoPrecio } from "../format"
import type { DetallePlan, PlanActual } from "../types"

/**
 * Confirmación del cambio de plan con su resumen (plan, precio y duración). El pago es
 * simulado: no se cobra nada.
 */
export function DialogoCambiarPlan({
  destino,
  actual,
  alCerrar,
  alCambiar,
}: {
  /** Plan elegido; nulo = cerrado. */
  destino: DetallePlan | null
  actual: PlanActual
  alCerrar: () => void
  /** Se llama con el plan nuevo tras confirmar. */
  alCambiar: (nuevo: PlanActual) => void
}) {
  return (
    <Dialog open={destino !== null} onOpenChange={(abrir) => !abrir && alCerrar()}>
      {/* `key`: cada vez que se abre parte sin errores */}
      {destino && <Contenido key={destino.plan} destino={destino} actual={actual} alCerrar={alCerrar} alCambiar={alCambiar} />}
    </Dialog>
  )
}

function Contenido({
  destino,
  actual,
  alCerrar,
  alCambiar,
}: {
  destino: DetallePlan
  actual: PlanActual
  alCerrar: () => void
  alCambiar: (nuevo: PlanActual) => void
}) {
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const esGratis = destino.plan === "gratis"
  const renueva = destino.plan === actual.detalle.plan && !esGratis
  const excedente = esGratis ? actual.conductores_usados - (destino.limite_conductores ?? 0) : 0

  // Renovar suma un mes al vencimiento vigente; cambiar de plan empieza un mes desde hoy
  const base = renueva && actual.fecha_vencimiento ? new Date(actual.fecha_vencimiento) : new Date()
  const vence = destino.duracion_meses == null ? null : sumarMeses(base, destino.duracion_meses)

  const confirmar = async () => {
    setEnviando(true)
    setError(null)
    try {
      alCambiar(await cambiarPlan(destino.plan))
    } catch (e) {
      setError(e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO)
      setEnviando(false)
    }
  }

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {renueva ? `Renovar el plan ${destino.nombre}` : esGratis ? "Bajar al plan Gratis" : `Cambiar al plan ${destino.nombre}`}
        </DialogTitle>
        <DialogDescription>Revisa el resumen antes de confirmar.</DialogDescription>
      </DialogHeader>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-lg border border-border bg-muted p-4 text-cuerpo">
        <dt className="text-muted-foreground">Plan</dt>
        <dd className="text-right font-semibold">{destino.nombre}</dd>
        <dt className="text-muted-foreground">Precio</dt>
        <dd className="text-right font-semibold">
          {textoPrecio(destino)}
          {!esGratis && " al mes"}
        </dd>
        <dt className="text-muted-foreground">Duración</dt>
        <dd className="text-right font-semibold">
          {destino.duracion_meses == null
            ? "Sin vencimiento"
            : renueva
              ? `${destino.duracion_meses} mes más`
              : `${destino.duracion_meses} mes desde hoy`}
        </dd>
        {vence && (
          <>
            <dt className="text-muted-foreground">Vence el</dt>
            <dd className="text-right font-semibold">{formatearFechaCompleta(vence)}</dd>
          </>
        )}
        <dt className="text-muted-foreground">Incluye</dt>
        <dd className="text-right">
          {textoLimite(destino)} · historial {textoHistorial(destino)}
        </dd>
      </dl>

      {esGratis && (
        <p className="text-cuerpo-pequeno text-muted-foreground">
          El cambio es inmediato y no se devuelve lo que quede del plan actual. No se borra ningún dato: solo se limita
          lo que ves y lo que puedes registrar.
          {excedente > 0 &&
            ` Tienes ${actual.conductores_usados} conductores y el plan Gratis permite ${destino.limite_conductores}: se conservan todos, pero no podrás registrar más.`}
        </p>
      )}
      <p className="rounded-lg bg-tinte-secundario p-3 text-cuerpo-pequeno text-texto-evento-velocidad">
        Pago simulado: no se realiza ningún cobro.
      </p>

      {error && <AvisoError mensaje={error} />}
      <DialogFooter>
        <Button variant="outline" onClick={alCerrar} disabled={enviando}>
          Cancelar
        </Button>
        <Button onClick={confirmar} disabled={enviando} aria-busy={enviando}>
          {enviando && <Loader2 className="animate-spin" aria-label="Confirmando" />}
          Confirmar
        </Button>
      </DialogFooter>
    </DialogContent>
  )
}
