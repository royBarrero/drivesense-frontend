export type IdPlan = "gratis" | "premium" | "empresas"

export type FuncionPlan = "exportar" | "eventos_mapa_patrones" | "tablero_completo"

/** Un plan del catálogo (`GET /suscripciones/planes`). */
export interface DetallePlan {
  plan: IdPlan
  nombre: string
  /** Nulo = sin tope. */
  limite_conductores: number | null
  /** Ventana de historial; ambos nulos = historial completo. */
  historial_dias: number | null
  historial_meses: number | null
  funciones: Record<FuncionPlan, boolean>
  precio_bs: number
  /** Nulo = no vence (Gratis). */
  duracion_meses: number | null
}

/** Plan de la empresa del admin (`GET /suscripciones/plan`). */
export interface PlanActual {
  detalle: DetallePlan
  estado: "activo" | "por_vencer"
  fecha_inicio: string | null
  fecha_vencimiento: string | null
  dias_restantes: number | null
  conductores_usados: number
  aviso_vencimiento: boolean
}
