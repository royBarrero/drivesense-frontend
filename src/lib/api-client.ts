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
  /** Código propio del backend (`plan_limite`, `plan_funcion`…); nulo en los demás errores. */
  readonly codigoError: string | null

  constructor(
    mensaje: string,
    codigo: number | null = null,
    errores: ErrorCampo[] = [],
    codigoError: string | null = null,
  ) {
    super(mensaje)
    this.name = "ErrorApi"
    this.codigo = codigo
    this.errores = errores
    this.codigoError = codigoError
  }

  /** El plan de la empresa no permite la acción: se invita a mejorarlo. */
  get esDePlan(): boolean {
    return this.codigo === 403 && this.codigoError?.startsWith("plan_") === true
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
  const { errores, codigo } = datos as { errores?: ErrorCampo[]; codigo?: unknown }
  throw new ErrorApi(
    detail,
    respuesta.status,
    Array.isArray(errores) ? errores : [],
    typeof codigo === "string" ? codigo : null,
  )
}

/**
 * Descarga un archivo de la API (CSV, PDF…). `peticion` espera JSON, así que aquí se pide el
 * archivo con `fetch`. El nombre sale del `Content-Disposition`; si no viene, `nombreRespaldo`.
 */
export async function descargarArchivo(ruta: string, nombreRespaldo: string) {
  const token = leerToken()
  let respuesta: Response
  try {
    respuesta = await fetch(`${URL_API}${ruta}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
  } catch {
    throw new ErrorApi(ErrorApi.SIN_CONEXION)
  }
  if (!respuesta.ok) {
    const datos = (await respuesta.json().catch(() => null)) as {
      detail?: unknown
      errores?: ErrorCampo[]
      codigo?: unknown
    } | null
    const detalle = typeof datos?.detail === "string" ? datos.detail : ErrorApi.INESPERADO
    throw new ErrorApi(
      detalle,
      respuesta.status,
      Array.isArray(datos?.errores) ? datos.errores : [],
      typeof datos?.codigo === "string" ? datos.codigo : null,
    )
  }
  const nombre = respuesta.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/)?.[1] ?? nombreRespaldo
  const url = URL.createObjectURL(await respuesta.blob())
  const enlace = document.createElement("a")
  enlace.href = url
  enlace.download = nombre
  enlace.click()
  URL.revokeObjectURL(url)
}

/** `?a=1&b=2` sin los valores vacíos. */
export function consulta(parametros: Record<string, string | number | undefined>) {
  const busqueda = new URLSearchParams()
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor !== undefined && valor !== "") busqueda.set(clave, String(valor))
  }
  const texto = busqueda.toString()
  return texto ? `?${texto}` : ""
}
