// Token JWT de la sesión en localStorage. Todo va en try/catch: el almacenamiento
// puede estar bloqueado (modo privado, políticas del navegador) y la app no debe romperse.
const CLAVE_TOKEN = "drivesense.token"

export function leerToken(): string | null {
  try {
    return localStorage.getItem(CLAVE_TOKEN)
  } catch {
    return null
  }
}

export function guardarToken(token: string): void {
  try {
    localStorage.setItem(CLAVE_TOKEN, token)
  } catch {
    // Sin almacenamiento la sesión dura solo mientras la pestaña esté abierta
  }
}

export function borrarToken(): void {
  try {
    localStorage.removeItem(CLAVE_TOKEN)
  } catch {
    // Nada que borrar
  }
}
