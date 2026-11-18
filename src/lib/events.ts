import { ArrowDownToLine, ChevronsRight, CornerUpRight, Gauge, type LucideIcon } from "lucide-react"

import type { TipoEvento } from "./trip-types"

export interface EstiloEvento {
  nombre: string
  /** Para leyendas y columnas: "Frenada" / "Frenadas". */
  corto: string
  plural: string
  /** Cabecera de la tabla de viajes (angosta). */
  columna: string
  /** Tinte de fondo y texto sobre él (docs/diseno.md, 1.1). */
  tinte: string
  texto: string
  /** Punto de color de la leyenda y los marcadores. */
  punto: string
  relleno: string
  /** Trazo de los círculos del mapa (zonas donde se repite el tipo). */
  trazo: string
  /** Ícono del tipo (frenada: flecha hacia abajo, aceleración: avance, giro: curva, exceso: velocímetro). */
  icono: LucideIcon
}

/** En el orden de la app: frenadas, aceleraciones, giros, excesos. */
export const TIPOS_EVENTO: TipoEvento[] = [
  "frenada_brusca",
  "aceleracion_severa",
  "giro_agresivo",
  "exceso_velocidad",
]

export const ESTILO_EVENTO: Record<TipoEvento, EstiloEvento> = {
  frenada_brusca: {
    nombre: "Frenada brusca",
    corto: "Frenada",
    plural: "Frenadas",
    columna: "Frenadas",
    tinte: "bg-tinte-peligro",
    texto: "text-texto-evento-frenada",
    punto: "bg-texto-evento-frenada",
    relleno: "fill-texto-evento-frenada",
    trazo: "stroke-texto-evento-frenada",
    icono: ArrowDownToLine,
  },
  aceleracion_severa: {
    nombre: "Aceleración severa",
    corto: "Aceleración",
    plural: "Aceleraciones",
    columna: "Aceler.",
    tinte: "bg-tinte-confort",
    texto: "text-texto-evento-aceleracion",
    punto: "bg-texto-evento-aceleracion",
    relleno: "fill-texto-evento-aceleracion",
    trazo: "stroke-texto-evento-aceleracion",
    icono: ChevronsRight,
  },
  giro_agresivo: {
    nombre: "Giro agresivo",
    corto: "Giro",
    plural: "Giros",
    columna: "Giros",
    tinte: "bg-tinte-advertencia",
    texto: "text-texto-evento-giro",
    punto: "bg-texto-evento-giro",
    relleno: "fill-texto-evento-giro",
    trazo: "stroke-texto-evento-giro",
    icono: CornerUpRight,
  },
  exceso_velocidad: {
    nombre: "Exceso de velocidad",
    corto: "Exceso",
    plural: "Excesos",
    columna: "Excesos",
    tinte: "bg-tinte-secundario",
    texto: "text-texto-evento-velocidad",
    punto: "bg-texto-evento-velocidad",
    relleno: "fill-texto-evento-velocidad",
    trazo: "stroke-texto-evento-velocidad",
    icono: Gauge,
  },
}
