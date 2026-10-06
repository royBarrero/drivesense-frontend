import { useState } from "react"
import { Check, X } from "lucide-react"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { ErrorApi } from "@/lib/api-client"
import { formatearHora } from "@/lib/format"
import { cn } from "@/lib/utils"

import { desmarcarEvento, marcarEvento } from "../api"
import { ESTILO_EVENTO } from "../constants"
import { detalleEvento } from "../format"
import type { EventoPruebas, ResultadoValidacion } from "../types"

/**
 * Eventos del viaje con sus marcas Correcto / Falso (compartidas entre todos los que
 * usan la cuenta de pruebas). Se marcan al instante y se revierten si la API falla;
 * pulsar la marca puesta la quita.
 */
export function ListaEventos({ eventos }: { eventos: EventoPruebas[] }) {
  const [marcas, setMarcas] = useState<Record<number, ResultadoValidacion | null>>({})
  const [error, setError] = useState<string | null>(null)

  const marcaDe = (evento: EventoPruebas) => (evento.id in marcas ? marcas[evento.id] : evento.validacion)

  const elegir = async (evento: EventoPruebas, resultado: ResultadoValidacion) => {
    const anterior = marcaDe(evento)
    const nueva = anterior === resultado ? null : resultado
    setMarcas((m) => ({ ...m, [evento.id]: nueva }))
    setError(null)
    try {
      if (nueva) await marcarEvento(evento.id, nueva)
      else await desmarcarEvento(evento.id)
    } catch (e) {
      setMarcas((m) => ({ ...m, [evento.id]: anterior }))
      setError(e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO)
    }
  }

  const correctos = eventos.filter((e) => marcaDe(e) === "correcto").length
  const falsos = eventos.filter((e) => marcaDe(e) === "falso").length

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-3">
        <h2 className="text-subtitulo-grande">Eventos detectados</h2>
        <p className="text-cuerpo text-muted-foreground">
          {eventos.length} {eventos.length === 1 ? "evento" : "eventos"} · {correctos}{" "}
          {correctos === 1 ? "correcto" : "correctos"} · {falsos} {falsos === 1 ? "falso" : "falsos"}
        </p>
      </div>
      {error && (
        <div className="mt-3">
          <AvisoError mensaje={error} />
        </div>
      )}
      {eventos.length === 0 ? (
        <p className="py-8 text-center text-cuerpo text-muted-foreground">La app no detectó eventos en este viaje.</p>
      ) : (
        <ul className="divide-y divide-border">
          {eventos.map((evento) => {
            const estilo = ESTILO_EVENTO[evento.tipo]
            const marca = marcaDe(evento)
            return (
              <li key={evento.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
                <span className="w-12 font-numeros text-numero-metrica font-bold tabular-nums">
                  {formatearHora(evento.fecha)}
                </span>
                <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", estilo.tinte)}>
                  <span className={cn("size-3 rounded-full", estilo.punto)} />
                </span>
                <span className="min-w-40 flex-1">
                  <span className="block text-subtitulo">{estilo.nombre}</span>
                  <span className="block text-cuerpo-pequeno text-muted-foreground">{detalleEvento(evento)}</span>
                </span>
                <span className="flex gap-2" role="group" aria-label={`Marcar ${estilo.nombre.toLowerCase()}`}>
                  <Button
                    size="sm"
                    variant={marca === "correcto" ? "default" : "outline"}
                    className={cn(marca !== "correcto" && "text-texto-exito")}
                    aria-pressed={marca === "correcto"}
                    onClick={() => elegir(evento, "correcto")}
                  >
                    <Check className="size-4" />
                    Correcto
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className={cn(
                      marca === "falso"
                        ? "border-transparent bg-destructive text-primary-foreground hover:bg-destructive/90"
                        : "text-destructive",
                    )}
                    aria-pressed={marca === "falso"}
                    onClick={() => elegir(evento, "falso")}
                  >
                    <X className="size-4" />
                    Falso
                  </Button>
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
