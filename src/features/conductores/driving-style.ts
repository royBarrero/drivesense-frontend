import {
  Activity,
  ArrowDownToLine,
  ChevronsRight,
  CircleHelp,
  CornerUpRight,
  Gauge,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react"

import type { EstiloConduccion } from "./types"

export interface EstiloVisual {
  nombre: string
  /** Tinte de la cápsula y texto sobre él (docs/diseno.md, 8.10). */
  clase: string
  /** Relleno de la barra en Reportes. */
  relleno: string
  icono: LucideIcon
}

/**
 * Color según el riesgo (acordado): Prudente verde; Intermedio, Brusco en curvas y Acelerador
 * amarillo; Brusco al frenar y Veloz rojo (los de mayor riesgo); sin datos, gris. Los íconos de
 * los estilos de riesgo son los de su tipo de evento (`ESTILO_EVENTO`).
 */
export const ESTILO_CONDUCCION: Record<EstiloConduccion, EstiloVisual> = {
  prudente: {
    nombre: "Prudente",
    clase: "bg-tinte-primario text-texto-exito",
    relleno: "bg-primario",
    icono: ShieldCheck,
  },
  intermedio: {
    nombre: "Intermedio",
    clase: "bg-tinte-advertencia text-texto-evento-giro",
    relleno: "bg-advertencia",
    icono: Activity,
  },
  brusco_curvas: {
    nombre: "Brusco en curvas",
    clase: "bg-tinte-advertencia text-texto-evento-giro",
    relleno: "bg-advertencia",
    icono: CornerUpRight,
  },
  acelerador: {
    nombre: "Acelerador",
    clase: "bg-tinte-advertencia text-texto-evento-giro",
    relleno: "bg-advertencia",
    icono: ChevronsRight,
  },
  brusco_frenar: {
    nombre: "Brusco al frenar",
    clase: "bg-tinte-peligro text-destructive",
    relleno: "bg-peligro",
    icono: ArrowDownToLine,
  },
  veloz: {
    nombre: "Veloz",
    clase: "bg-tinte-peligro text-destructive",
    relleno: "bg-peligro",
    icono: Gauge,
  },
  sin_datos: {
    nombre: "Sin datos suficientes",
    clase: "bg-muted text-muted-foreground",
    relleno: "bg-borde-fuerte",
    icono: CircleHelp,
  },
}

/** Con estilo, de menor a mayor riesgo (el orden del backend). */
export const ESTILOS_POR_RIESGO: EstiloConduccion[] = [
  "prudente",
  "intermedio",
  "brusco_curvas",
  "acelerador",
  "brusco_frenar",
  "veloz",
]

/** "Pasó de Intermedio a Brusco al frenar". */
export function textoAlerta(anterior: EstiloConduccion, actual: EstiloConduccion) {
  return `Pasó de ${ESTILO_CONDUCCION[anterior].nombre} a ${ESTILO_CONDUCCION[actual].nombre}`
}
