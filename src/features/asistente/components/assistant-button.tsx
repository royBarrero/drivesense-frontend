import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react"
import { Loader2, MessageCircleQuestion, RotateCcw, SendHorizontal } from "lucide-react"

import { CapsulaIA } from "@/components/ai-badge"
import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet"
import { useSesion } from "@/features/auth/session-context"
import { ErrorApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

import { enviarMensajes, MAXIMO_PREGUNTA, obtenerSugerencias } from "../api"
import type { MensajeAsistente } from "../types"

const SALUDO =
  "Hola, soy el asistente de DriveSense. Pregúntame cómo usar el panel: registrar conductores, ver sus " +
  "puntajes, exportar reportes, cambiar de plan y más."

/**
 * Botón flotante de ayuda y el chat del asistente en un panel lateral (docs/diseno.md, 8.11).
 * Vive en el layout del panel: la conversación se conserva al cambiar de página y se borra al
 * cerrar sesión (el layout se desmonta).
 */
export function AsistenteAyuda() {
  const { cerrarSesion } = useSesion()
  const [abierto, setAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<MensajeAsistente[]>([])
  const [sugerencias, setSugerencias] = useState<string[] | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [texto, setTexto] = useState("")
  const final = useRef<HTMLDivElement>(null)

  // Las sugerencias se piden la primera vez que se abre; si fallan, el chat funciona sin ellas
  useEffect(() => {
    if (!abierto || sugerencias !== null) return
    obtenerSugerencias()
      .then((r) => setSugerencias(r.sugerencias))
      .catch(() => setSugerencias([]))
  }, [abierto, sugerencias])

  // Baja hasta el último mensaje
  useEffect(() => {
    final.current?.scrollIntoView({ block: "end" })
  }, [mensajes, enviando, error, abierto])

  const pedirRespuesta = async (conversacion: MensajeAsistente[]) => {
    setEnviando(true)
    setError(null)
    try {
      const respuesta = await enviarMensajes(conversacion)
      setMensajes([...conversacion, { rol: "asistente", ...respuesta }])
    } catch (e) {
      if (e instanceof ErrorApi && e.codigo === 401) {
        cerrarSesion()
        return
      }
      setError(e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO)
    } finally {
      setEnviando(false)
    }
  }

  const preguntar = (pregunta: string) => {
    const limpia = pregunta.trim()
    if (!limpia || enviando) return
    const conversacion: MensajeAsistente[] = [...mensajes, { rol: "usuario", texto: limpia }]
    setMensajes(conversacion)
    setTexto("")
    void pedirRespuesta(conversacion)
  }

  const enviar = (e: FormEvent) => {
    e.preventDefault()
    preguntar(texto)
  }

  // Enter envía; Shift + Enter agrega una línea
  const alTeclear = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault()
      preguntar(texto)
    }
  }

  const nueva = () => {
    setMensajes([])
    setError(null)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="fixed right-6 bottom-6 z-40 flex h-14 items-center gap-2 rounded-full bg-encabezado-fondo pr-5 pl-4 text-cuerpo font-semibold text-encabezado-texto shadow-tarjeta transition-colors hover:bg-encabezado-superficie focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        <MessageCircleQuestion className="size-6 text-encabezado-acento" aria-hidden="true" />
        Ayuda
      </button>

      <Sheet open={abierto} onOpenChange={setAbierto}>
        <SheetContent side="right" className="w-full gap-0 bg-background p-0 sm:max-w-md">
          <header className="flex items-start gap-3 border-b border-border bg-card px-5 py-4 pr-14">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-tinte-primario text-texto-exito">
              <MessageCircleQuestion className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              {/* font-semibold: el SheetTitle de Shadcn trae font-medium, que pisa el peso del token */}
              <SheetTitle className="text-subtitulo-grande font-semibold">Asistente de ayuda</SheetTitle>
              <SheetDescription className="text-cuerpo-pequeno text-muted-foreground">
                Pregunta cómo usar el panel. No ve los datos de tu empresa.
              </SheetDescription>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4" aria-live="polite">
            <div className="flex flex-col gap-2">
              <Burbuja mensaje={{ rol: "asistente", texto: SALUDO }} />
              {mensajes.length === 0 && sugerencias && sugerencias.length > 0 && (
                <div className="mt-1 flex flex-wrap gap-2">
                  {sugerencias.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => preguntar(s)}
                      className="rounded-full border border-borde-fuerte bg-card px-3 py-2 text-left text-cuerpo-pequeno font-semibold text-foreground transition-colors hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
              {mensajes.map((m, i) => (
                <Burbuja key={i} mensaje={m} />
              ))}
              {enviando && (
                <div className="max-w-5/6 self-start rounded-xl rounded-tl-sm border border-border bg-card px-4 py-3 text-cuerpo-pequeno text-muted-foreground">
                  Escribiendo…
                </div>
              )}
              {error && (
                <div className="mt-1 flex flex-col items-start gap-2">
                  <AvisoError mensaje={error} />
                  <Button variant="outline" size="sm" onClick={() => void pedirRespuesta(mensajes)}>
                    Reintentar
                  </Button>
                </div>
              )}
              <div ref={final} />
            </div>
          </div>

          <form onSubmit={enviar} className="flex items-end gap-2 border-t border-border bg-card px-4 py-3">
            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              onKeyDown={alTeclear}
              maxLength={MAXIMO_PREGUNTA}
              rows={1}
              placeholder="Escribe tu pregunta"
              aria-label="Tu pregunta"
              className="field-sizing-content max-h-32 min-h-11 flex-1 resize-none rounded-lg border border-input bg-muted px-4 py-2.5 text-cuerpo text-foreground outline-none placeholder:text-texto-terciario focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20"
            />
            <Button type="submit" size="icon" disabled={enviando || !texto.trim()} aria-label="Enviar">
              {enviando ? <Loader2 className="animate-spin" aria-hidden="true" /> : <SendHorizontal aria-hidden="true" />}
            </Button>
          </form>
          {mensajes.length > 0 && (
            <div className="flex justify-center border-t border-border bg-card pb-3">
              <Button variant="link" size="link" onClick={nueva} disabled={enviando}>
                <RotateCcw aria-hidden="true" />
                Nueva conversación
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}

function Burbuja({ mensaje }: { mensaje: MensajeAsistente }) {
  const delUsuario = mensaje.rol === "usuario"
  return (
    <div
      className={cn(
        "max-w-5/6 rounded-xl px-4 py-3",
        delUsuario
          ? "self-end rounded-tr-sm bg-encabezado-fondo text-encabezado-texto"
          : "self-start rounded-tl-sm border border-border bg-card text-foreground",
      )}
    >
      <p className="text-cuerpo whitespace-pre-line">{mensaje.texto}</p>
      {mensaje.generada_por_ia && <CapsulaIA titulo="Respuesta redactada por IA" className="mt-2" />}
    </div>
  )
}
