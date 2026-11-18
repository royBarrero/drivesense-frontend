export type TipoEvento = "frenada_brusca" | "aceleracion_severa" | "giro_agresivo" | "exceso_velocidad"

/** Punto GPS de la ruta de un viaje. */
export interface PuntoRuta {
  lat: number
  lon: number
  fecha: string
  velocidad_kmh: number
}

/** Evento de riesgo con su posición, como lo devuelve el detalle de un viaje. */
export interface EventoViaje {
  tipo: TipoEvento
  fecha: string
  lat: number
  lon: number
  velocidad_kmh: number
  intensidad: number
  duracion_s: number | null
  velocidad_maxima_kmh: number | null
}
