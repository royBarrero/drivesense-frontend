import type { Calificacion } from "@/lib/score"
import type { EventoViaje, PuntoRuta, TipoEvento } from "@/lib/trip-types"

export type Periodo = "7d" | "30d" | "todo"

/** Periodo de un reporte exportado (HU-27): los del panel o un rango de fechas. */
export type PeriodoReporte = Periodo | "rango"
export type FormatoReporte = "pdf" | "csv"

export interface OpcionesReporte {
  periodo: PeriodoReporte
  /** `AAAA-MM-DD`; solo con `periodo = "rango"` */
  desde?: string
  hasta?: string
  formato: FormatoReporte
}
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

// --- Perfil de un conductor (HU-25) ---

export type NivelRiesgo = "alto" | "medio" | "bajo"
export type BaseTendencia = "periodo_anterior" | "mitades"
export type Agrupacion = "viaje" | "dia" | "semana"
export type Categoria = "velocidad" | "frenadas" | "aceleraciones" | "giros"

export interface CategoriaPerfil {
  promedio: number
  /** Frente al periodo anterior; nula en "Todo" o si antes no hubo viajes. */
  diferencia: number | null
}

export interface PuntoEvolucion {
  fecha: string
  drivescore: number
  viajes: number
}

/** `GET /flotas/conductores/{id}` */
export interface PerfilConductor {
  conductor: { id: number; nombre: string; email: string }
  viajes: number
  distancia_m: number
  drivescore: number | null
  calificacion: Calificacion | null
  nivel_riesgo: NivelRiesgo | null
  tendencia: number | null
  /** Con qué se compara: el periodo anterior (7 y 30 días) o las dos mitades del periodo ("Todo"). */
  tendencia_base: BaseTendencia
  categorias: Record<Categoria, CategoriaPerfil> | null
  punto_debil: TipoEvento | null
  eventos_por_tipo: Record<TipoEvento, number>
  eventos: number
  eventos_por_10km: number | null
  agrupacion: Agrupacion
  evolucion: PuntoEvolucion[]
}

/** Fila de `GET /flotas/conductores/{id}/recorridos` */
export interface ViajeConductor {
  id: number
  fecha_inicio: string
  fecha_fin: string
  distancia_m: number
  duracion_s: number
  drivescore: number | null
  calificacion: Calificacion | null
}

export interface RecomendacionViaje {
  tipo: string
  titulo: string
  texto: string
  /** Redactada por la IA con los datos del viaje; falsa = plantilla fija. */
  generada_por_ia: boolean
}

/** `GET /flotas/conductores/{id}/recorridos/{viaje}` */
export interface DetalleViajeConductor extends ViajeConductor {
  velocidad_maxima_kmh: number
  velocidad_promedio_kmh: number
  ruta: PuntoRuta[] | null
  puntaje_frenadas: number | null
  puntaje_aceleraciones: number | null
  puntaje_giros: number | null
  puntaje_velocidad: number | null
  eventos_por_tipo: Record<TipoEvento, number> | null
  eventos: EventoViaje[] | null
  recomendacion: RecomendacionViaje | null
  recomendaciones_secundarias: RecomendacionViaje[]
}

// --- Historial de eventos de riesgo (HU-26) ---

export type Vista = "resumen" | "eventos"
export type FranjaHoraria = "manana" | "tarde" | "noche"

/** Fila de `GET /flotas/conductores/{id}/eventos`; `dia` y `hora` van en la zona de la empresa. */
export interface EventoConductor extends EventoViaje {
  id: number
  recorrido_id: number
  /** YYYY-MM-DD */
  dia: string
  /** HH:MM */
  hora: string
}

export interface PaginaEventos {
  eventos: EventoConductor[]
  total: number
}

export interface PatronesEventos {
  /** Eventos del periodo que hacen falta para hablar de un patrón. */
  minimo: number
  hay_patron: boolean
  tipo_mas_frecuente: TipoEvento | null
  /** 1 = lunes … 7 = domingo. */
  dia_mas_frecuente: number | null
  franja_mas_frecuente: FranjaHoraria | null
  /** Eventos por día de la semana, de lunes a domingo. */
  por_dia: number[]
  por_franja: Record<FranjaHoraria, number>
}

/** `GET /flotas/conductores/{id}/eventos/resumen` */
export interface ResumenEventos {
  total: number
  por_tipo: Record<TipoEvento, number>
  patrones: PatronesEventos
}

export interface PuntoEvento {
  id: number
  recorrido_id: number
  tipo: TipoEvento
  lat: number
  lon: number
  fecha: string
}

/** Lugar donde se repiten eventos del mismo tipo. */
export interface ZonaRepetida {
  tipo: TipoEvento
  lat: number
  lon: number
  radio_m: number
  eventos: number
}

/** `GET /flotas/conductores/{id}/eventos/mapa` */
export interface MapaEventos {
  puntos: PuntoEvento[]
  zonas: ZonaRepetida[]
  /** Hay más eventos en el periodo que los puntos devueltos (los más recientes). */
  truncado: boolean
}
