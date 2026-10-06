import { leerToken } from "@/lib/session"

export const URL_API =`${import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000"}/api/v1`

export interface ErrorCampo {
  /** Ruta del campo en la API: `email`, `empresa.telefono`, `administrador.email`… */
  campo: string | null
  mensaje: string
}

/** Error de la API traducido. `mensaje` es el `detail` del backend, ya en español. */
export class ErrorApi extends Error {
  static readonly SIN_CONEXION = "No se pudo conectar con el servidor"
  // Único mensaje propio: la respuesta no trae `detail` (p. ej. un 500)
  static readonly INESPERADO = "Ocurrió un error inesperado. Intenta de nuevo."

  readonly codigo: number | null
  readonly errores: ErrorCampo[]

  constructor(mensaje: string, codigo: number | null = null, errores: ErrorCampo[] = []) {
    super(mensaje)
    this.name = "ErrorApi"
    this.codigo = codigo
    this.errores = errores
  }

  get mensaje(): string {
    return this.message
  }
}

interface OpcionesPeticion {
  metodo?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  cuerpo?: unknown
}

/** Llama a la API. Añade `Authorization: Bearer` si hay sesión y lanza `ErrorApi` si falla. */
export async function peticion<T>(ruta: string, { metodo = "GET", cuerpo }: OpcionesPeticion = {}): Promise<T> {
  const cabeceras: Record<string, string> = { Accept: "application/json" }
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json"
  const token = leerToken()
  if (token) cabeceras.Authorization = `Bearer ${token}`

  let respuesta: Response
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
    })
  } catch {
    // fetch solo falla sin respuesta: servidor caído, sin red o CORS
    throw new ErrorApi(ErrorApi.SIN_CONEXION)
  }

  const datos: unknown = await respuesta.json().catch(() => null)
  if (respuesta.ok) return datos as T

  const detail = (datos as { detail?: unknown } | null)?.detail
  if (typeof detail !== "string") {
    throw new ErrorApi(ErrorApi.INESPERADO, respuesta.status)
  }
  const errores = (datos as { errores?: ErrorCampo[] }).errores
  throw new ErrorApi(detail, respuesta.status, Array.isArray(errores) ? errores : [])
}
