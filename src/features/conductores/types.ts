import type { Calificacion } from "@/lib/score"

export type Periodo = "7d" | "30d" | "todo"
export type Orden = "drivescore" | "viajes" | "ultimo_viaje"
export type Direccion = "asc" | "desc"

export interface ConductorFlota {
  id: number
  nombre: string
  email: string
  /** Promedio ponderado por distancia del periodo; nulo si no tiene viajes con puntaje. */
  drivescore: number | null
  calificacion: Calificacion | null
  viajes: number
  ultimo_viaje: string | null
}

export interface PaginaConductores {
  conductores: ConductorFlota[]
  total: number
}

export interface ResumenFlota {
  conductores: number
  drivescore_promedio: number | null
  calificacion: Calificacion | null
  eventos: number
}

export interface FiltrosConductores {
  periodo: Periodo
  q?: string
  orden: Orden
  direccion: Direccion
}

export interface DatosNuevoConductor {
  nombre: string
  email: string
  telefono: string
}

/** Respuesta del alta: la contraseña temporal solo llega esta vez. */
export interface ConductorCreado {
  id: number
  nombre: string
  email: string
  telefono: string
  contrasenia_temporal: string
}
