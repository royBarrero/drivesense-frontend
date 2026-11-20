import type { Agrupacion, EstiloConduccion, PuntoEvolucion } from "@/features/conductores/types"
import type { Calificacion } from "@/lib/score"
import type { TipoEvento } from "@/lib/trip-types"

/** Conductor de un ranking del tablero. */
export interface ItemRanking {
  id: number
  nombre: string
  drivescore: number
  calificacion: Calificacion
  distancia_m: number
  eventos: number
  /** Eventos por cada 10 km del periodo. */
  eventos_por_10km: number | null
}

export interface ConteoCalificaciones {
  excelente: number
  muy_bueno: number
  regular: number
  riesgoso: number
  /** Conductores activos sin viajes con puntaje en el periodo. */
  sin_viajes: number
}

/** Indicadores de toda la flota en el periodo (`GET /flotas/tablero`). */
export interface TableroFlota {
  /** Falso con el plan Gratis: solo vienen las tarjetas y lo demás está vacío. */
  completo: boolean
  /** Conductores activos (no depende del periodo). */
  conductores: number
  conductores_con_viajes: number
  viajes: number
  distancia_m: number
  drivescore: number | null
  calificacion: Calificacion | null
  eventos: number
  eventos_por_10km: number | null
  conductores_en_riesgo: number
  /** Distancia mínima en el periodo para entrar en los rankings. */
  distancia_minima_ranking_m: number
  mejores: ItemRanking[]
  a_vigilar: ItemRanking[]
  por_calificacion: ConteoCalificaciones
  eventos_por_tipo: Record<TipoEvento, number>
  evolucion: { agrupacion: Agrupacion; puntos: PuntoEvolucion[] }
  /** Conductores activos por estilo de conducción (últimos 30 días, no depende del periodo); en ceros sin el plan completo. */
  por_estilo: Record<EstiloConduccion, number>
}
