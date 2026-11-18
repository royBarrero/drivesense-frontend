import { formatearDecimal, formatearVelocidad } from "@/lib/format"
import type { EventoViaje } from "@/lib/trip-types"

/** "14 s" o, desde un minuto, "1:05". */
function duracionExceso(segundos: number) {
  const total = Math.round(segundos)
  if (total < 60) return `${total} s`
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`
}

/** Igual que la app (`FormatoEvento.detalle`): "3,6 m/s² · a 41 km/h",
 *  "2,9 m/s² · desde 12 km/h" o "14 s · máx. 81 km/h". */
export function detalleEvento(evento: EventoViaje) {
  if (evento.tipo === "exceso_velocidad") {
    return `${duracionExceso(evento.duracion_s ?? 0)} · máx. ${formatearVelocidad(evento.velocidad_maxima_kmh ?? 0)}`
  }
  const preposicion = evento.tipo === "aceleracion_severa" ? "desde" : "a"
  return `${formatearDecimal(evento.intensidad)} m/s² · ${preposicion} ${formatearVelocidad(evento.velocidad_kmh)}`
}
