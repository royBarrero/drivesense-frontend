import { formatearDecimal, formatearVelocidad } from "@/lib/format"

import type { Dispositivo, EventoPruebas } from "./types"

/** "Galaxy A34 · v1.0.3"; sin dispositivo (app anterior), el respaldo (el correo). */
export function textoDispositivo(dispositivo: Dispositivo, respaldo: string) {
  const partes = [dispositivo.dispositivo_modelo, dispositivo.version_app && `v${dispositivo.version_app}`]
  return partes.filter(Boolean).join(" · ") || respaldo
}

/** "Moto G54 · Android 14 · app v1.0.2", o nulo si la app no lo envió. */
export function textoDispositivoCompleto(dispositivo: Dispositivo) {
  const partes = [
    dispositivo.dispositivo_modelo,
    dispositivo.dispositivo_android && `Android ${dispositivo.dispositivo_android}`,
    dispositivo.version_app && `app v${dispositivo.version_app}`,
  ]
  return partes.filter(Boolean).join(" · ") || null
}

/** "14 s" o, desde un minuto, "1:05". */
function duracionExceso(segundos: number) {
  const total = Math.round(segundos)
  if (total < 60) return `${total} s`
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

/** Igual que la app (`FormatoEvento.detalle`): "3,6 m/s² · a 41 km/h",
 *  "2,9 m/s² · desde 12 km/h" o "14 s · máx. 81 km/h". */
export function detalleEvento(evento: EventoPruebas) {
  if (evento.tipo === "exceso_velocidad") {
    return `${duracionExceso(evento.duracion_s ?? 0)} · máx. ${formatearVelocidad(evento.velocidad_maxima_kmh ?? 0)}`
  }
  const preposicion = evento.tipo === "aceleracion_severa" ? "desde" : "a"
  return `${formatearDecimal(evento.intensidad)} m/s² · ${preposicion} ${formatearVelocidad(evento.velocidad_kmh)}`
}
