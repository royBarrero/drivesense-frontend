export type RolMensaje = "usuario" | "asistente"

/** Mensaje de la conversación con el asistente de ayuda (la guarda el panel; el backend no). */
export interface MensajeAsistente {
  rol: RolMensaje
  texto: string
  /** Solo en las respuestas: la redactó la IA (falso = respuesta fija). */
  generada_por_ia?: boolean
}

/** `POST /asistente/mensajes` */
export interface RespuestaAsistente {
  texto: string
  generada_por_ia: boolean
}
