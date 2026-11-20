import type { TipoEvento } from "@/lib/trip-types"

/**
 * Copia de `UmbralesDeteccion` de la app (`drivesense-mobile`,
 * `lib/features/telemetria/models/event_detector.dart`): si cambian allá, cambiarlos aquí.
 */
export const UMBRALES = {
  /** Caída de la velocidad entre lecturas seguidas (m/s²). */
  frenadaBruscaMs2: 2.5,
  /** Subida de la velocidad entre lecturas seguidas (m/s²). */
  aceleracionSeveraMs2: 2.0,
  /** La frenada se evalúa si la lectura anterior iba al menos a esto. */
  velocidadMinimaFrenadaKmh: 10,
  /** La aceleración se evalúa si la lectura actual llega al menos a esto. */
  velocidadMinimaAceleracionKmh: 8,
  /** Aceleración lateral = velocidad × giro alrededor de la vertical (m/s²). */
  giroAgresivoMs2: 3.5,
  /** A esta velocidad o menos no se evalúan giros. */
  velocidadMinimaGiroKmh: 15,
  limiteVelocidadKmh: 60,
  /** Tiempo seguido sobre el límite para que cuente como exceso (s). */
  duracionMinimaExcesoS: 5,
  /** El mismo tipo de evento no se repite antes de esto (s). */
  separacionMinimaEventosS: 3,
  /** Con un hueco mayor entre lecturas no se evalúa el cambio de velocidad (s). */
  separacionMaximaLecturasS: 3,
} as const

/** Lectura del "GPS" simulado: una por segundo. `t` en segundos desde el inicio. */
export interface Lectura {
  t: number
  velocidadMs: number
  lat: number
  lon: number
}

/** Como `EventoRiesgo` de la app; `velocidadPreviaMs` sigue sus mismas reglas por tipo. */
export interface EventoDetectado {
  tipo: TipoEvento
  t: number
  intensidad: number
  lat: number
  lon: number
  velocidadPreviaMs: number
  /** Solo en el exceso. */
  velocidadMaximaMs?: number
  duracionS?: number
  enCurso?: boolean
}

const LIMITE_MS = UMBRALES.limiteVelocidadKmh / 3.6
const MINIMA_FRENADA_MS = UMBRALES.velocidadMinimaFrenadaKmh / 3.6
const MINIMA_ACELERACION_MS = UMBRALES.velocidadMinimaAceleracionKmh / 3.6
const MINIMA_GIRO_MS = UMBRALES.velocidadMinimaGiroKmh / 3.6

/**
 * Detector de eventos con las reglas de `DetectorEventos` de la app: un evento por maniobra (el
 * mismo tipo no se repite hasta que su valor vuelve bajo el umbral, y nunca antes de 3 s), cada
 * tipo con su propio estado y el exceso como un evento por tramo que se actualiza mientras dura.
 * Sin baches ni teléfono movido: el giro siempre es "confiable".
 */
export class DetectorEventos {
  /** Recibe cada evento nuevo o actualizado (el exceso, con el mismo `tipo` y `t`). */
  alDetectar: (evento: EventoDetectado) => void = () => {}

  private previa: Lectura | null = null
  private ultimaLectura: Lectura | null = null
  private readonly sobreUmbral = new Set<TipoEvento>()
  private readonly ultimoEvento = new Map<TipoEvento, number>()
  private excesoDesde: Lectura | null = null
  private excesoMaximaMs = 0
  private exceso: EventoDetectado | null = null

  /** Frenada, aceleración y exceso, con cada lectura del GPS. */
  evaluar(actual: Lectura) {
    const previa = this.previa
    this.previa = actual
    this.ultimaLectura = actual
    const hueco = previa === null || actual.t - previa.t > UMBRALES.separacionMaximaLecturasS
    this.evaluarExceso(actual, hueco)
    if (previa === null || hueco) return

    const cambio = (actual.velocidadMs - previa.velocidadMs) / (actual.t - previa.t)
    this.registrar(
      "frenada_brusca",
      previa.velocidadMs >= MINIMA_FRENADA_MS ? -cambio : 0,
      UMBRALES.frenadaBruscaMs2,
      actual.t,
      actual,
      previa.velocidadMs,
    )
    this.registrar(
      "aceleracion_severa",
      actual.velocidadMs >= MINIMA_ACELERACION_MS ? cambio : 0,
      UMBRALES.aceleracionSeveraMs2,
      actual.t,
      actual,
      previa.velocidadMs,
    )
  }

  /**
   * Giro, con cada muestra del giroscopio: `giroRadS` es el giro alrededor de la vertical
   * promediado 1 s. Usa la última velocidad del GPS, como la app.
   */
  evaluarGiro(t: number, giroRadS: number) {
    const velocidad = this.ultimaLectura
    if (velocidad === null || t - velocidad.t > UMBRALES.separacionMaximaLecturasS) return
    const lento = velocidad.velocidadMs <= MINIMA_GIRO_MS
    this.registrar(
      "giro_agresivo",
      lento ? 0 : Math.abs(giroRadS) * velocidad.velocidadMs,
      UMBRALES.giroAgresivoMs2,
      t,
      velocidad,
      velocidad.velocidadMs,
    )
  }

  /** Cierra el exceso abierto al terminar el viaje (como `cerrarEventosEnCurso`). */
  cerrar() {
    this.cerrarExceso()
  }

  private evaluarExceso(actual: Lectura, tramoNuevo: boolean) {
    const sobre = actual.velocidadMs > LIMITE_MS
    if (!sobre || tramoNuevo) this.cerrarExceso()
    if (!sobre) return

    const desde = (this.excesoDesde ??= actual)
    this.excesoMaximaMs = Math.max(this.excesoMaximaMs, actual.velocidadMs)
    const duracion = actual.t - desde.t
    if (duracion < UMBRALES.duracionMinimaExcesoS) return

    this.exceso = {
      tipo: "exceso_velocidad",
      t: desde.t,
      intensidad: this.excesoMaximaMs - LIMITE_MS,
      lat: desde.lat,
      lon: desde.lon,
      velocidadPreviaMs: desde.velocidadMs,
      velocidadMaximaMs: this.excesoMaximaMs,
      duracionS: duracion,
      enCurso: true,
    }
    this.alDetectar(this.exceso)
  }

  private cerrarExceso() {
    const exceso = this.exceso
    this.excesoDesde = null
    this.excesoMaximaMs = 0
    this.exceso = null
    if (exceso) this.alDetectar({ ...exceso, enCurso: false })
  }

  private registrar(
    tipo: TipoEvento,
    intensidad: number,
    umbral: number,
    t: number,
    lectura: Lectura,
    velocidadPreviaMs: number,
  ) {
    if (intensidad < umbral) {
      this.sobreUmbral.delete(tipo)
      return
    }
    if (this.sobreUmbral.has(tipo)) return
    this.sobreUmbral.add(tipo)

    const ultimo = this.ultimoEvento.get(tipo)
    if (ultimo !== undefined && t - ultimo < UMBRALES.separacionMinimaEventosS) return
    this.ultimoEvento.set(tipo, t)
    this.alDetectar({ tipo, t, intensidad, lat: lectura.lat, lon: lectura.lon, velocidadPreviaMs })
  }
}
