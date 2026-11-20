/**
 * Copiloto por voz del simulador: qué decir y cuándo. Copia de `GuiaVoz` y `UmbralesCopiloto` de
 * la app (`drivesense-mobile`, `lib/features/navegacion/models/voice_guide.dart` y
 * `route_progress.dart`): si cambian allá, cambiarlos aquí. Lógica pura.
 */

/** Los tipos de maniobra que usan las rutas de la demo (nombres de `TipoPaso` de la app). */
export type TipoPasoDemo =
  | "girar_izquierda"
  | "girar_derecha"
  | "girar_leve_izquierda"
  | "girar_leve_derecha"
  | "mantener_izquierda"
  | "mantener_derecha"
  | "entrar_rotonda"
  | "salir_rotonda"
  | "seguir_recto"

export interface PasoDemo {
  /** Distancia desde la salida hasta la maniobra, medida sobre la ruta (m). */
  distanciaM: number
  tipo: TipoPasoDemo
  calle?: string
  salidaRotonda?: number
}

export const UMBRALES_COPILOTO = {
  /** Aviso lejano, solo si el tramo hasta la maniobra es largo (m). */
  avisoLejosM: 300,
  tramoLargoM: 400,
  avisoCercaM: 100,
  /** "Ahora, …" (m). */
  avisoAhoraM: 30,
  /** "Llegaste a tu destino." a esta distancia del final (m). */
  llegadaM: 30,
} as const

export const FRASE_LLEGADA = "Llegaste a tu destino."

type Aviso = "lejos" | "cerca" | "ahora"
const ORDEN_AVISOS: Aviso[] = ["lejos", "cerca", "ahora"]

const ORDINALES = ["primera", "segunda", "tercera", "cuarta", "quinta", "sexta", "séptima", "octava", "novena", "décima"]

/** "100 metros", "1,5 kilómetros": bajo 100 a la decena, desde ahí a la cincuentena. */
export function metrosHablados(metros: number) {
  if (metros >= 1000) {
    const km = Math.round(metros / 100) / 10
    const texto = Number.isInteger(km) ? String(km) : km.toFixed(1).replace(".", ",")
    return `${texto} kilómetro${km === 1 ? "" : "s"}`
  }
  const redondeo = metros < 100 ? 10 : 50
  const valor = Math.min(950, Math.max(10, Math.round(metros / redondeo) * redondeo))
  return `${valor} metros`
}

/** La acción en tuteo: "gira a la derecha en Avenida Busch". */
export function maniobra(paso: PasoDemo) {
  const enCalle = paso.calle ? ` en ${paso.calle}` : ""
  const porCalle = paso.calle ? ` por ${paso.calle}` : ""
  switch (paso.tipo) {
    case "girar_izquierda":
      return `gira a la izquierda${enCalle}`
    case "girar_derecha":
      return `gira a la derecha${enCalle}`
    case "girar_leve_izquierda":
      return `gira levemente a la izquierda${enCalle}`
    case "girar_leve_derecha":
      return `gira levemente a la derecha${enCalle}`
    case "mantener_izquierda":
      return `mantente a la izquierda${porCalle}`
    case "mantener_derecha":
      return `mantente a la derecha${porCalle}`
    case "entrar_rotonda":
      return paso.salidaRotonda
        ? `en la rotonda, toma la ${ORDINALES[paso.salidaRotonda - 1] ?? `${paso.salidaRotonda}.ª`} salida`
        : "entra a la rotonda"
    case "salir_rotonda":
      return `sal de la rotonda${porCalle}`
    case "seguir_recto":
      return `sigue derecho${porCalle}`
  }
}

/** "En 100 metros, gira a la derecha." o, sin distancia, "Ahora, gira a la derecha.". */
export function frase(paso: PasoDemo, distanciaM: number | null) {
  return `${distanciaM === null ? "Ahora" : `En ${metrosHablados(distanciaM)}`}, ${maniobra(paso)}.`
}

/** Texto corto para la pantalla: "Gira a la derecha". */
export function titulo(paso: PasoDemo) {
  const texto = maniobra({ ...paso, calle: undefined })
  return texto[0].toUpperCase() + texto.slice(1)
}

/** La próxima maniobra a partir de `recorridoM` y los metros hasta ella; nula si no quedan. */
export function proximaManiobra(pasos: PasoDemo[], recorridoM: number) {
  const indice = pasos.findIndex((p) => p.distanciaM > recorridoM)
  if (indice < 0) return null
  return { indice, paso: pasos[indice], distanciaM: pasos[indice].distanciaM - recorridoM }
}

/** Decide los avisos de un viaje: cada umbral se dice una sola vez por maniobra. */
export class GuiaVozDemo {
  private readonly dichos = new Map<number, Set<Aviso>>()
  private llegadaDicha = false
  private readonly pasos: PasoDemo[]
  private readonly largoM: number

  constructor(pasos: PasoDemo[], largoM: number) {
    this.pasos = pasos
    this.largoM = largoM
  }

  /** Lo que hay que decir con lo recorrido, o nulo. */
  evaluar(recorridoM: number): string | null {
    if (this.llegadaDicha) return null
    if (this.largoM - recorridoM <= UMBRALES_COPILOTO.llegadaM) {
      this.llegadaDicha = true
      return FRASE_LLEGADA
    }
    const proxima = proximaManiobra(this.pasos, recorridoM)
    if (!proxima) return null
    const { indice, paso, distanciaM } = proxima
    const tramo = paso.distanciaM - (indice === 0 ? 0 : this.pasos[indice - 1].distanciaM)

    let aviso: Aviso
    if (distanciaM <= UMBRALES_COPILOTO.avisoAhoraM) aviso = "ahora"
    else if (distanciaM <= UMBRALES_COPILOTO.avisoCercaM) aviso = "cerca"
    else if (distanciaM <= UMBRALES_COPILOTO.avisoLejosM && tramo > UMBRALES_COPILOTO.tramoLargoM) aviso = "lejos"
    else return null

    const dichos = this.dichos.get(indice) ?? new Set<Aviso>()
    this.dichos.set(indice, dichos)
    if (dichos.has(aviso)) return null
    // Un aviso más cercano deja sin sentido los más lejanos
    for (const a of ORDEN_AVISOS.slice(0, ORDEN_AVISOS.indexOf(aviso) + 1)) dichos.add(a)
    return frase(paso, aviso === "ahora" ? null : distanciaM)
  }
}
