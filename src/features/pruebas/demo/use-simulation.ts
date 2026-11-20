import { useCallback, useEffect, useRef, useState } from "react"

import type { TipoEvento } from "@/lib/trip-types"

import type { RutaDemo } from "./routes"
import { Simulador, type EstadoSimulador } from "./simulator"

/** Cada cuánto se redibuja el tablero y el mapa (ms); la física corre en cada cuadro. */
const PUBLICAR_CADA_MS = 100
/** Un cuadro muy largo (pestaña en segundo plano) no adelanta más que esto (s). */
const MAXIMO_CUADRO_S = 0.25

/**
 * Corre el simulador en tiempo real con `requestAnimationFrame` y publica su estado unas 10 veces
 * por segundo. Las flechas arriba / abajo aceleran y frenan mientras el viaje está en curso.
 */
export function useSimulacion() {
  const simulador = useRef<Simulador | null>(null)
  const inicio = useRef<Date | null>(null)
  const cuadro = useRef<number | null>(null)
  const [estado, setEstado] = useState<EstadoSimulador | null>(null)
  const [enCurso, setEnCurso] = useState(false)

  const parar = useCallback(() => {
    if (cuadro.current !== null) cancelAnimationFrame(cuadro.current)
    cuadro.current = null
    setEnCurso(false)
  }, [])

  useEffect(() => parar, [parar])

  const iniciar = useCallback(
    (ruta: RutaDemo) => {
      parar()
      const sim = new Simulador(ruta.puntos)
      simulador.current = sim
      inicio.current = new Date()
      setEstado(sim.estado())
      setEnCurso(true)

      let anterior = performance.now()
      let publicado = anterior
      const bucle = (ahora: number) => {
        sim.avanzar(Math.min((ahora - anterior) / 1000, MAXIMO_CUADRO_S))
        anterior = ahora
        if (ahora - publicado >= PUBLICAR_CADA_MS) {
          publicado = ahora
          setEstado(sim.estado())
        }
        cuadro.current = requestAnimationFrame(bucle)
      }
      cuadro.current = requestAnimationFrame(bucle)
    },
    [parar],
  )

  /** Detiene la simulación y devuelve el cuerpo para guardar el viaje. */
  const terminar = useCallback(
    (ruta: RutaDemo) => {
      parar()
      const sim = simulador.current
      if (!sim || !inicio.current) return null
      sim.acelerando = false
      sim.frenando = false
      sim.terminar()
      setEstado(sim.estado())
      return sim.resumen(inicio.current, ruta)
    },
    [parar],
  )

  /** Vuelve al estado inicial, sin viaje. */
  const reiniciar = useCallback(() => {
    parar()
    simulador.current = null
    inicio.current = null
    setEstado(null)
  }, [parar])

  const acelerar = useCallback((activo: boolean) => {
    if (simulador.current) simulador.current.acelerando = activo
  }, [])

  const frenar = useCallback((activo: boolean) => {
    if (simulador.current) simulador.current.frenando = activo
  }, [])

  const forzar = useCallback((tipo: TipoEvento) => {
    simulador.current?.forzar(tipo)
  }, [])

  const motivoNoDisponible = useCallback(
    (tipo: TipoEvento) => (simulador.current ? simulador.current.motivoNoDisponible(tipo) : "Inicia el viaje"),
    [],
  )

  // Flechas del teclado mientras el viaje está en curso
  useEffect(() => {
    if (!enCurso) return
    const cambiar = (evento: KeyboardEvent, activo: boolean) => {
      if (evento.key !== "ArrowUp" && evento.key !== "ArrowDown") return
      // Las flechas no mueven la página ni el selector enfocado
      evento.preventDefault()
      if (evento.key === "ArrowUp") acelerar(activo)
      else frenar(activo)
    }
    const abajo = (e: KeyboardEvent) => cambiar(e, true)
    const arriba = (e: KeyboardEvent) => cambiar(e, false)
    // Al perder el foco la ventana no llega el keyup: se sueltan los dos
    const soltar = () => {
      acelerar(false)
      frenar(false)
    }
    window.addEventListener("keydown", abajo)
    window.addEventListener("keyup", arriba)
    window.addEventListener("blur", soltar)
    return () => {
      window.removeEventListener("keydown", abajo)
      window.removeEventListener("keyup", arriba)
      window.removeEventListener("blur", soltar)
      soltar()
    }
  }, [enCurso, acelerar, frenar])

  return { estado, enCurso, iniciar, terminar, reiniciar, acelerar, frenar, forzar, motivoNoDisponible }
}
