import type { Dispositivo } from "./types"

export { detalleEvento } from "@/lib/event-format"

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
