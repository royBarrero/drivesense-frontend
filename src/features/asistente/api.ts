import { peticion } from "@/lib/api-client"

import type { MensajeAsistente, RespuestaAsistente } from "./types"

/** Tope del backend: se envían los mensajes más recientes. */
export const MAXIMO_MENSAJES_ENVIADOS = 20
export const MAXIMO_PREGUNTA = 500

/** Preguntas frecuentes del admin, para empezar. */
export function obtenerSugerencias() {
  return peticion<{ sugerencias: string[] }>("/asistente/sugerencias")
}

/** Respuesta a la última pregunta de la conversación. */
export function enviarMensajes(conversacion: MensajeAsistente[]) {
  const mensajes = conversacion
    .slice(-MAXIMO_MENSAJES_ENVIADOS)
    .map(({ rol, texto }) => ({ rol, texto }))
  return peticion<RespuestaAsistente>("/asistente/mensajes", { metodo: "POST", cuerpo: { mensajes } })
}
