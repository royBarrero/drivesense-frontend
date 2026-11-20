import { useCallback, useEffect, useRef, useState } from "react"

/** Como la app: español de Bolivia, si no de EE. UU. (latino), si no cualquier español. */
const IDIOMAS = ["es-BO", "es-US"]

function sintetizador() {
  return typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null
}

function elegirVoz(voces: SpeechSynthesisVoice[]) {
  const normal = (v: SpeechSynthesisVoice) => v.lang.replace("_", "-").toLowerCase()
  for (const idioma of IDIOMAS) {
    const voz = voces.find((v) => normal(v) === idioma.toLowerCase())
    if (voz) return voz
  }
  return voces.find((v) => normal(v).startsWith("es")) ?? null
}

/**
 * Voz del navegador (Web Speech API) para el Copiloto del simulador. Sin voz en español o sin
 * `speechSynthesis`, no habla. Las indicaciones de ruta cortan lo que se esté diciendo; los
 * avisos de evento esperan su turno.
 */
export function useVoz() {
  const [activa, setActiva] = useState(true)
  const activaRef = useRef(activa)
  const disponible = sintetizador() !== null

  useEffect(() => {
    activaRef.current = activa
    if (!activa) sintetizador()?.cancel()
  }, [activa])

  // Chrome carga las voces en segundo plano: se piden al abrir para tenerlas al iniciar.
  // Al salir de la página no sigue hablando.
  useEffect(() => {
    sintetizador()?.getVoices()
    return () => sintetizador()?.cancel()
  }, [])

  const hablar = useCallback((texto: string, prioridad: boolean) => {
    const s = sintetizador()
    if (!s || !activaRef.current) return
    const voz = elegirVoz(s.getVoices())
    if (!voz) return
    if (prioridad) s.cancel()
    const frase = new SpeechSynthesisUtterance(texto)
    frase.voice = voz
    frase.lang = voz.lang
    s.speak(frase)
  }, [])

  const callar = useCallback(() => sintetizador()?.cancel(), [])

  return { activa, setActiva, disponible, hablar, callar }
}
