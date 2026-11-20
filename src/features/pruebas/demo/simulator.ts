import type { PuntoRuta, TipoEvento } from "@/lib/trip-types"

import { DetectorEventos, UMBRALES, type EventoDetectado, type Lectura } from "./detector"
import type { RutaDemo } from "./routes"

/**
 * Física del auto y maniobras del simulador de demo. Lógica pura: la página llama a `avanzar` con
 * el tiempo real transcurrido y lee `estado()`. Los controles normales quedan bajo los umbrales de
 * aceleración y frenada, y el auto reduce solo antes de las curvas cerradas y del destino, como un
 * conductor (`velocidadPermitida`): en la demo esos eventos y el giro salen solo con sus botones.
 * El exceso sí puede salir manejando.
 */
export const FISICA = {
  /** Aceleración con la flecha arriba (m/s²), que baja con la velocidad hasta un 20 %. */
  aceleracionMs2: 1.6,
  velocidadMaximaMs: 90 / 3.6,
  /** Pérdida de velocidad al soltar el acelerador (m/s²). */
  desaceleracionLibreMs2: 0.4,
  /** Frenada progresiva con la flecha abajo: empieza en 1 y sube 0,5 por segundo hasta 2 m/s². */
  frenadaInicialMs2: 1,
  frenadaSubidaMs2PorS: 0.5,
  frenadaMaximaMs2: 2,
  /** Paso de la simulación (s): 50 muestras por segundo, como el giroscopio de la app. */
  paso: 0.02,
  /** El rumbo se mide entre los puntos a esta distancia hacia atrás y hacia adelante (m). */
  ventanaRumboM: 10,
  /** Aceleración lateral máxima con la que el auto toma las curvas solo (m/s²). */
  lateralCurvaMs2: 2.5,
  /** Frenada con la que reduce solo antes de una curva o del destino (m/s²). */
  frenadaAutomaticaMs2: 1.8,
  /** Bajo esta velocidad la app no evalúa giros: no hace falta ir más lento en una curva. */
  velocidadMinimaCurvaMs: 14 / 3.6,
  /** Resolución del perfil de velocidades permitidas (m). */
  pasoPerfilM: 2,
} as const

/** Maniobras de los botones: pasan el umbral con margen. */
export const MANIOBRAS = {
  aceleracion: { ms2: 3.2, duracionS: 2 },
  frenada: { ms2: 4.5, duracionS: 2 },
  /** Giro brusco: aceleración lateral constante y después la vuelta al carril, más suave. */
  giro: { lateralMs2: 5, duracionS: 1.5, vueltaS: 3 },
  /** Sobre el límite unos 8 s: pasa los 5 s seguidos que exige la app. */
  exceso: { objetivoKmh: 68, subidaMs2: 1.5, mantenerS: 6, bajadaMs2: 1 },
} as const

/** Velocidad mínima para que un botón de evento pueda generar su maniobra. */
export const MINIMA_BOTON_KMH: Partial<Record<TipoEvento, number>> = {
  frenada_brusca: 15,
  giro_agresivo: UMBRALES.velocidadMinimaGiroKmh + 5,
}

/** Como `UmbralesRuta` de la app: un punto cada 5 s o 20 m. */
const RUTA_CADA_S = 5
const RUTA_CADA_M = 20
/** Zona muerta del giroscopio de la app (`UmbralesFiltro.zonaMuertaGiroRadS`). */
const ZONA_MUERTA_GIRO = 0.03

type Maniobra =
  | { tipo: "aceleracion_severa" | "frenada_brusca" | "giro_agresivo"; desde: number; signo: number }
  | { tipo: "exceso_velocidad"; desde: number; fase: "subir" | "mantener" | "bajar"; hasta: number; volverA: number }

export interface EstadoSimulador {
  t: number
  distanciaM: number
  velocidadKmh: number
  aceleracionMs2: number
  lat: number
  lon: number
  /** Grados, 0 = norte, con el desvío del giro brusco. */
  rumbo: number
  maniobra: TipoEvento | null
  llego: boolean
  eventos: EventoDetectado[]
}

// --- Geometría de la ruta ----------------------------------------------------

const RADIO_TIERRA = 6_371_000
const rad = (g: number) => (g * Math.PI) / 180

function distancia(a: [number, number], b: [number, number]) {
  const h =
    Math.sin(rad(b[0] - a[0]) / 2) ** 2 + Math.cos(rad(a[0])) * Math.cos(rad(b[0])) * Math.sin(rad(b[1] - a[1]) / 2) ** 2
  return 2 * RADIO_TIERRA * Math.asin(Math.sqrt(h))
}

function rumboEntre(a: [number, number], b: [number, number]) {
  const y = Math.sin(rad(b[1] - a[1])) * Math.cos(rad(b[0]))
  const x = Math.cos(rad(a[0])) * Math.sin(rad(b[0])) - Math.sin(rad(a[0])) * Math.cos(rad(b[0])) * Math.cos(rad(b[1] - a[1]))
  return Math.atan2(y, x)
}

/** Diferencia de ángulos en (−π, π]. */
function diferenciaAngulo(a: number, b: number) {
  let d = a - b
  while (d > Math.PI) d -= 2 * Math.PI
  while (d <= -Math.PI) d += 2 * Math.PI
  return d
}

export class GeometriaRuta {
  readonly puntos: [number, number][]
  readonly acumulada: number[]
  readonly largoM: number

  constructor(puntos: [number, number][]) {
    this.puntos = puntos
    this.acumulada = [0]
    for (let i = 1; i < puntos.length; i++) {
      this.acumulada.push(this.acumulada[i - 1] + distancia(puntos[i - 1], puntos[i]))
    }
    this.largoM = this.acumulada.at(-1) ?? 0
  }

  /** Posición a `d` metros del inicio. */
  posicion(d: number): [number, number] {
    const m = Math.min(Math.max(d, 0), this.largoM)
    let i = 1
    while (i < this.acumulada.length - 1 && this.acumulada[i] < m) i++
    const tramo = this.acumulada[i] - this.acumulada[i - 1]
    const f = tramo > 0 ? (m - this.acumulada[i - 1]) / tramo : 0
    const [a, b] = [this.puntos[i - 1], this.puntos[i]]
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]
  }

  /** Rumbo suavizado (radianes): así los quiebres del trazado no parecen volantazos. */
  rumbo(d: number) {
    const desde = Math.max(0, Math.min(d - FISICA.ventanaRumboM, this.largoM - 2 * FISICA.ventanaRumboM))
    return rumboEntre(this.posicion(desde), this.posicion(desde + 2 * FISICA.ventanaRumboM))
  }

  private perfil: number[] | null = null
  /** Separación real entre los valores del perfil: el último cae justo en el destino. */
  private pasoPerfil: number = FISICA.pasoPerfilM

  /**
   * Velocidad máxima (m/s) a `d` metros para tomar las curvas con `lateralCurvaMs2` y llegar
   * detenido al destino, frenando como mucho con `frenadaAutomaticaMs2`.
   */
  velocidadPermitida(d: number) {
    const perfil = (this.perfil ??= this.calcularPerfil())
    const x = Math.min(Math.max(d / this.pasoPerfil, 0), perfil.length - 1)
    const i = Math.min(Math.floor(x), perfil.length - 2)
    // Interpolada: por tramos, al llegar frenaría de golpe
    return perfil[i] + (perfil[i + 1] - perfil[i]) * (x - i)
  }

  /** La menor velocidad permitida entre `desde` y `hasta`. */
  velocidadPermitidaEntre(desde: number, hasta: number) {
    let minima = Infinity
    for (let d = desde; d <= Math.min(hasta, this.largoM); d += FISICA.pasoPerfilM) {
      minima = Math.min(minima, this.velocidadPermitida(d))
    }
    return minima
  }

  private calcularPerfil() {
    const n = Math.max(Math.ceil(this.largoM / FISICA.pasoPerfilM), 1) + 1
    const paso = (this.pasoPerfil = this.largoM / (n - 1))
    const perfil: number[] = []
    for (let i = 0; i < n; i++) {
      const d = i * paso
      const curvatura = Math.abs(diferenciaAngulo(this.rumbo(d + paso / 2), this.rumbo(d - paso / 2))) / paso
      const enCurva = curvatura > 0 ? Math.sqrt(FISICA.lateralCurvaMs2 / curvatura) : FISICA.velocidadMaximaMs
      perfil.push(Math.min(FISICA.velocidadMaximaMs, Math.max(FISICA.velocidadMinimaCurvaMs, enCurva)))
    }
    // Llega detenido y frena a tiempo: de atrás hacia adelante, v² ≤ v_siguiente² + 2·a·paso
    perfil[n - 1] = 0
    for (let i = n - 2; i >= 0; i--) {
      perfil[i] = Math.min(perfil[i], Math.sqrt(perfil[i + 1] ** 2 + 2 * FISICA.frenadaAutomaticaMs2 * paso))
    }
    return perfil
  }

  /** Puntos ya recorridos, con la posición actual al final. */
  recorrido(d: number): [number, number][] {
    const hechos = this.puntos.filter((_, i) => this.acumulada[i] < d)
    return [...hechos, this.posicion(d)]
  }
}

// --- Simulador ---------------------------------------------------------------

export class Simulador {
  readonly geometria: GeometriaRuta
  acelerando = false
  frenando = false

  private t = 0
  private d = 0
  private v = 0
  private a = 0
  private frenandoDesde = 0
  private maniobra: Maniobra | null = null
  /** Desvío del giro brusco (rad) y su giro (rad/s). */
  private desvio = 0
  private giroExtra = 0
  private rumboAnterior: number
  /** Muestras del giro del último segundo, para el promedio de 1 s de la app. */
  private muestrasGiro: { t: number; giro: number }[] = []
  private giroPromedio = 0
  private siguienteLectura = 0
  private readonly detector = new DetectorEventos()
  private readonly eventos: EventoDetectado[] = []
  private readonly ruta: { t: number; lat: number; lon: number; velocidadMs: number; d: number }[] = []
  private velocidadMaximaMs = 0

  constructor(puntos: [number, number][]) {
    this.geometria = new GeometriaRuta(puntos)
    this.rumboAnterior = this.geometria.rumbo(0)
    this.detector.alDetectar = (evento) => {
      // El exceso se actualiza: reemplaza al de igual tipo e instante
      const i = this.eventos.findIndex((e) => e.tipo === evento.tipo && e.t === evento.t)
      if (i >= 0) this.eventos[i] = evento
      else this.eventos.push(evento)
    }
    this.leer()
  }

  get llego() {
    return this.d >= this.geometria.largoM
  }

  /** Avanza la simulación `segundos` (tiempo real), en pasos de 20 ms. */
  avanzar(segundos: number) {
    let resta = segundos
    while (resta > 1e-9) {
      const dt = Math.min(FISICA.paso, resta)
      this.paso(dt)
      resta -= dt
    }
  }

  /** Por qué no se puede forzar `tipo` ahora; nulo si se puede. */
  motivoNoDisponible(tipo: TipoEvento): string | null {
    if (this.llego) return "Ya llegaste al destino"
    if (this.maniobra) return "Hay una maniobra en curso"
    const minima = MINIMA_BOTON_KMH[tipo]
    if (minima !== undefined && this.v * 3.6 < minima) return `Ve a más de ${minima} km/h`
    const g = this.geometria
    if (tipo === "aceleracion_severa") {
      const { ms2, duracionS } = MANIOBRAS.aceleracion
      const final = this.v + ms2 * duracionS
      if (g.velocidadPermitidaEntre(this.d, this.d + final * duracionS + 30) < final) return "Hay una curva cerca"
    }
    if (tipo === "exceso_velocidad") {
      // Lo que recorre hasta llegar al objetivo, mientras lo mantiene y hasta bajar del límite
      const { objetivoKmh, subidaMs2, mantenerS, bajadaMs2 } = MANIOBRAS.exceso
      const objetivo = objetivoKmh / 3.6
      const limite = UMBRALES.limiteVelocidadKmh / 3.6
      const subida = Math.max(objetivo ** 2 - this.v ** 2, 0) / (2 * subidaMs2)
      const sobreLimite = objetivo * mantenerS + (objetivo ** 2 - limite ** 2) / (2 * bajadaMs2)
      if (g.velocidadPermitidaEntre(this.d, this.d + subida + sobreLimite) < objetivo) return "Hay una curva cerca"
    }
    return null
  }

  forzar(tipo: TipoEvento) {
    if (this.motivoNoDisponible(tipo)) return
    if (tipo === "exceso_velocidad") {
      this.maniobra = { tipo, desde: this.t, fase: "subir", hasta: 0, volverA: Math.min(this.v, 50 / 3.6) }
    } else {
      // Hacia el mismo lado de la curva en la que esté (en recta, a la izquierda): si fuera al
      // contrario, los dos giros se restarían
      this.maniobra = { tipo, desde: this.t, signo: this.giroPromedio > 0 ? 1 : -1 }
    }
  }

  estado(): EstadoSimulador {
    const [lat, lon] = this.geometria.posicion(this.d)
    const rumbo = this.geometria.rumbo(this.d) + this.desvio
    return {
      t: this.t,
      distanciaM: this.d,
      velocidadKmh: this.v * 3.6,
      aceleracionMs2: this.a,
      lat,
      lon,
      rumbo: ((rumbo * 180) / Math.PI + 360) % 360,
      maniobra: this.maniobra?.tipo ?? null,
      llego: this.llego,
      eventos: [...this.eventos],
    }
  }

  /** Cierra el viaje: termina el exceso abierto y agrega la última posición a la ruta. */
  terminar() {
    this.detector.cerrar()
    const [lat, lon] = this.geometria.posicion(this.d)
    const ultimo = this.ruta.at(-1)
    if (!ultimo || ultimo.t < this.t) this.ruta.push({ t: this.t, lat, lon, velocidadMs: this.v, d: this.d })
  }

  /** Cuerpo de `POST /pruebas/conductores/{id}/recorridos-simulados`, como lo manda la app. */
  resumen(inicio: Date, ruta: RutaDemo) {
    const fecha = (t: number) => new Date(inicio.getTime() + t * 1000).toISOString()
    const [latInicio, lonInicio] = this.geometria.puntos[0]
    const [latFin, lonFin] = this.geometria.posicion(this.d)
    const destino = ruta.puntos.at(-1) ?? ruta.puntos[0]
    const duracionS = Math.round(this.t)
    const maximaKmh = this.velocidadMaximaMs * 3.6
    const promedioKmh = duracionS > 0 ? Math.min((this.d / duracionS) * 3.6, maximaKmh) : 0
    const puntos: PuntoRuta[] = this.ruta.map((p) => ({
      lat: p.lat,
      lon: p.lon,
      fecha: fecha(p.t),
      velocidad_kmh: p.velocidadMs * 3.6,
    }))
    return {
      fecha_fin: fecha(this.t),
      distancia_m: this.d,
      duracion_s: duracionS,
      velocidad_maxima_kmh: maximaKmh,
      velocidad_promedio_kmh: promedioKmh,
      lat_inicio: latInicio,
      lon_inicio: lonInicio,
      lat_fin: latFin,
      lon_fin: lonFin,
      ruta: puntos,
      eventos: this.eventos.map((e) => ({
        tipo: e.tipo,
        fecha: fecha(e.t),
        lat: e.lat,
        lon: e.lon,
        velocidad_kmh: e.velocidadPreviaMs * 3.6,
        intensidad: e.intensidad,
        ...(e.tipo === "exceso_velocidad"
          ? { duracion_s: e.duracionS ?? 0, velocidad_maxima_kmh: (e.velocidadMaximaMs ?? 0) * 3.6 }
          : {}),
      })),
      destino: { nombre: ruta.destino, lat: destino[0], lon: destino[1] },
      dispositivo_modelo: "Simulador del panel",
    }
  }

  private paso(dt: number) {
    this.a = this.llego ? 0 : this.aceleracion()
    // Reduce solo antes de una curva cerrada o del destino (salvo en la frenada y el giro forzados)
    const permitida = this.geometria.velocidadPermitida(this.d + this.v * dt)
    const tipo = this.maniobra?.tipo
    if (this.v > permitida && tipo !== "frenada_brusca" && tipo !== "giro_agresivo") {
      this.a = Math.min(this.a, -Math.min(FISICA.frenadaAutomaticaMs2, (this.v - permitida) / dt))
    }
    this.v = Math.min(Math.max(this.v + this.a * dt, 0), FISICA.velocidadMaximaMs)
    this.d = Math.min(this.d + this.v * dt, this.geometria.largoM)
    if (this.llego) {
      this.v = 0
      this.maniobra = null
    }
    this.t += dt

    // Giro alrededor de la vertical: el de la ruta más el del giro brusco
    const rumbo = this.geometria.rumbo(this.d)
    const giroRuta = diferenciaAngulo(rumbo, this.rumboAnterior) / dt
    this.rumboAnterior = rumbo
    this.desvio += this.giroExtra * dt
    this.muestrasGiro.push({ t: this.t, giro: giroRuta + this.giroExtra })
    this.muestrasGiro = this.muestrasGiro.filter((m) => this.t - m.t < 1)
    const promedio = this.muestrasGiro.reduce((s, m) => s + m.giro, 0) / this.muestrasGiro.length
    this.giroPromedio = Math.abs(promedio) < ZONA_MUERTA_GIRO ? 0 : promedio
    this.detector.evaluarGiro(this.t, this.giroPromedio)

    if (this.t >= this.siguienteLectura) this.leer()
  }

  /** Lectura del GPS (1 Hz): detector, velocidad máxima y puntos de la ruta. */
  private leer() {
    const [lat, lon] = this.geometria.posicion(this.d)
    const lectura: Lectura = { t: this.t, velocidadMs: this.v, lat, lon }
    this.detector.evaluar(lectura)
    this.velocidadMaximaMs = Math.max(this.velocidadMaximaMs, this.v)
    const ultimo = this.ruta.at(-1)
    if (!ultimo || this.t - ultimo.t >= RUTA_CADA_S || this.d - ultimo.d >= RUTA_CADA_M) {
      this.ruta.push({ ...lectura, d: this.d })
    }
    this.siguienteLectura += 1
  }

  private aceleracion(): number {
    this.giroExtra = 0
    const m = this.maniobra
    if (m) {
      const transcurrido = this.t - m.desde
      switch (m.tipo) {
        case "aceleracion_severa":
          if (transcurrido < MANIOBRAS.aceleracion.duracionS) return MANIOBRAS.aceleracion.ms2
          break
        case "frenada_brusca":
          if (transcurrido < MANIOBRAS.frenada.duracionS && this.v > 0) return -MANIOBRAS.frenada.ms2
          break
        case "giro_agresivo": {
          const { lateralMs2, duracionS, vueltaS } = MANIOBRAS.giro
          const v = Math.max(this.v, 1)
          if (transcurrido < duracionS) {
            this.giroExtra = (m.signo * lateralMs2) / v
            return 0
          }
          if (transcurrido < duracionS + vueltaS && Math.abs(this.desvio) > 0.005) {
            // Vuelve al carril a la mitad del giro: queda bajo el umbral
            this.giroExtra = (-Math.sign(this.desvio) * lateralMs2 * duracionS) / (vueltaS * v)
            return 0
          }
          this.desvio = 0
          break
        }
        case "exceso_velocidad": {
          const { objetivoKmh, subidaMs2, mantenerS, bajadaMs2 } = MANIOBRAS.exceso
          const objetivo = objetivoKmh / 3.6
          if (m.fase === "subir") {
            if (this.v < objetivo) return Math.min(subidaMs2, (objetivo - this.v) / FISICA.paso)
            m.fase = "mantener"
            m.hasta = this.t + mantenerS
          }
          if (m.fase === "mantener") {
            if (this.t < m.hasta) return 0
            m.fase = "bajar"
          }
          if (this.v > m.volverA) return -Math.min(bajadaMs2, (this.v - m.volverA) / FISICA.paso)
          break
        }
      }
      this.maniobra = null
    }

    if (this.frenando) {
      const segundos = this.t - this.frenandoDesde
      return -Math.min(FISICA.frenadaInicialMs2 + FISICA.frenadaSubidaMs2PorS * segundos, FISICA.frenadaMaximaMs2)
    }
    this.frenandoDesde = this.t
    if (this.acelerando) {
      const factor = Math.max(0.2, 1 - this.v / FISICA.velocidadMaximaMs)
      return FISICA.aceleracionMs2 * factor
    }
    return this.v > 0 ? -FISICA.desaceleracionLibreMs2 : 0
  }
}
