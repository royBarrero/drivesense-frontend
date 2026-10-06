/** Formatos de números y fechas del panel, en español (es-BO) y en la zona del navegador.
 *  Entre número y unidad va un espacio de no separación (NBSP): en celdas angostas
 *  "22,9 km" no se parte en dos líneas. */

const NBSP = "\u00a0"

const LOCALE = "es-BO"

const hora = new Intl.DateTimeFormat(LOCALE, { hour: "2-digit", minute: "2-digit", hour12: false })
const diaMes = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short" })

/** Iniciales de las dos primeras palabras: "Luis Quispe" → "LQ". */
export function iniciales(nombre: string) {
  return nombre
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0]?.toUpperCase() ?? "")
    .join("")
}

/** Primera palabra del nombre, para los saludos. */
export function primerNombre(nombre: string) {
  return nombre.trim().split(/\s+/)[0] ?? ""
}

/** "08:10" */
export function formatearHora(fecha: Date | string) {
  return hora.format(new Date(fecha))
}

/** "3 oct", sin el punto que agrega Intl a los meses abreviados. */
export function formatearDiaMes(fecha: Date | string) {
  return diaMes.format(new Date(fecha)).replace(".", "").replace(" ", NBSP)
}

function mismoDia(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

/** "Hoy", "Ayer" o "3 oct". */
export function formatearDia(fecha: Date | string, ahora = new Date()) {
  const dia = new Date(fecha)
  if (mismoDia(dia, ahora)) return "Hoy"
  const ayer = new Date(ahora)
  ayer.setDate(ayer.getDate() - 1)
  if (mismoDia(dia, ayer)) return "Ayer"
  return formatearDiaMes(dia)
}

/** "Hoy 08:10", "Ayer 19:05" o "3 oct 18:20". */
export function formatearFechaHora(fecha: Date | string, ahora = new Date()) {
  return `${formatearDia(fecha, ahora)} ${formatearHora(fecha)}`
}

/** Número con coma decimal: 16.24 → "16,2". */
export function formatearDecimal(valor: number, decimales = 1) {
  return valor.toLocaleString(LOCALE, { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
}

/** Entero con separador de miles: 1234 → "1.234". */
export function formatearEntero(valor: number) {
  return Math.round(valor).toLocaleString(LOCALE)
}

/** Metros → "16,2 km". */
export function formatearKm(metros: number) {
  return `${formatearDecimal(metros / 1000)}${NBSP}km`
}

/** Segundos → "32 min" o "1 h 05 min"; menos de un minuto, "40 s". */
export function formatearDuracion(segundos: number) {
  if (segundos < 60) return `${Math.round(segundos)}${NBSP}s`
  const minutos = Math.round(segundos / 60)
  if (minutos < 60) return `${minutos}${NBSP}min`
  return `${Math.floor(minutos / 60)}${NBSP}h ${String(minutos % 60).padStart(2, "0")}${NBSP}min`
}

/** Velocidad redondeada: "68 km/h". */
export function formatearVelocidad(kmh: number) {
  return `${Math.round(kmh)}${NBSP}km/h`
}
