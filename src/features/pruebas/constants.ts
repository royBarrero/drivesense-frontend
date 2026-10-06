import type { TipoEvento } from "./types"

/** Límite fijo del exceso de velocidad en la app (`UmbralesDeteccion.limiteVelocidadKmh`
 *  en drivesense-mobile). Si cambia allá, cambiarlo aquí. */
export const LIMITE_VELOCIDAD_KMH = 60

/** Viajes por página en la tabla de pruebas. */
export const VIAJES_POR_PAGINA = 20

interface EstiloEvento {
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
  },
}
