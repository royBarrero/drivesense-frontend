import type { Calificacion } from "@/lib/score"

export type TipoEvento = "frenada_brusca" | "aceleracion_severa" | "giro_agresivo" | "exceso_velocidad"
export type EstadoRecorrido = "finalizado" | "descartado"
export type ResultadoValidacion = "correcto" | "falso"
export type FiltroEventos = "con" | "sin"

/** `GET /pruebas/resumen` */
export interface ResumenPruebas {
  testers: number
  testers_registrados: number
  viajes: number
  /** Nulo sin periodo ("Todo"). */
  viajes_anterior: number | null
  descartados: number
  distancia_m: number
  drivescore_promedio: number | null
  calificacion: Calificacion | null
  eventos: number
  eventos_por_10km: number | null
}

export interface ConductorPruebas {
  id: number
  nombre: string
  email: string
}

export interface Dispositivo {
  dispositivo_modelo: string | null
  dispositivo_android: string | null
  version_app: string | null
}

/** Fila de `GET /pruebas/recorridos`. */
export interface RecorridoPruebas extends Dispositivo {
  id: number
  estado: EstadoRecorrido
  conductor: ConductorPruebas
  fecha_inicio: string
  fecha_fin: string
  distancia_m: number
  duracion_s: number
  velocidad_maxima_kmh: number
  velocidad_promedio_kmh: number
  drivescore: number | null
  calificacion: Calificacion | null
  /** Nulo si el viaje no tiene puntaje: no se guardaron sus eventos. */
  eventos_por_tipo: Record<TipoEvento, number> | null
}

export interface PaginaRecorridos {
  recorridos: RecorridoPruebas[]
  total: number
}

export interface PuntoRuta {
  lat: number
  lon: number
  fecha: string
  velocidad_kmh: number
}

export interface EventoPruebas {
  id: number
  tipo: TipoEvento
  fecha: string
  lat: number
  lon: number
  velocidad_kmh: number
  intensidad: number
  duracion_s: number | null
  velocidad_maxima_kmh: number | null
  validacion: ResultadoValidacion | null
}

/** `GET /pruebas/recorridos/{id}` */
export interface DetallePruebas extends Omit<RecorridoPruebas, "eventos_por_tipo"> {
  ruta: PuntoRuta[] | null
  puntaje_frenadas: number | null
  puntaje_aceleraciones: number | null
  puntaje_giros: number | null
  puntaje_velocidad: number | null
  eventos_por_tipo: Record<TipoEvento, number> | null
  eventos: EventoPruebas[] | null
}

/** Fila de `GET /pruebas/testers`. */
export interface TesterPruebas {
  id: number
  nombre: string
  email: string
  viajes: number
  distancia_m: number
  drivescore_promedio: number | null
  calificacion: Calificacion | null
  eventos: number
  eventos_por_10km: number | null
  ultimo_viaje: string | null
}

export interface FiltrosRecorridos {
  desde?: string
  usuario_id?: number
  eventos?: FiltroEventos
}
