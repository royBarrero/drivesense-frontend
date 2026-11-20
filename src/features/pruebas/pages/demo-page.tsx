import { useEffect, useMemo, useRef, useState } from "react"
import type { LatLngTuple } from "leaflet"
import { CheckCircle2, Loader2, MapPinned, Play, Presentation, Square, Trash2, Users } from "lucide-react"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useConsulta } from "@/hooks/use-consulta"
import { ErrorApi } from "@/lib/api-client"
import { ESTILO_EVENTO } from "@/lib/events"
import { formatearDecimal } from "@/lib/format"

import { crearRecorridoSimulado, listarTesters } from "../api"
import { GuiaVozDemo } from "../demo/copilot"
import { TarjetaCopiloto } from "../demo/copilot-card"
import { MapaDemo } from "../demo/demo-map"
import { DialogoBorrarSimulados } from "../demo/delete-simulated-dialog"
import { ResultadoDemo } from "../demo/demo-result"
import { RUTAS_DEMO } from "../demo/routes"
import { GeometriaRuta } from "../demo/simulator"
import { TableroViaje } from "../demo/trip-dashboard"
import { useSimulacion } from "../demo/use-simulation"
import { useVoz } from "../demo/use-voice"
import type { RecorridoSimulado } from "../types"

type Fase = "listo" | "en_curso" | "guardando" | "resultado"

/**
 * Pruebas · Simulador de demo (temporal): maneja un auto sobre una ruta fija y guarda el viaje a
 * nombre de un conductor, como si lo enviara su teléfono.
 */
export function DemoPruebasPagina() {
  const testers = useConsulta("demo:testers", () => listarTesters())
  const [conductorId, setConductorId] = useState<string>("")
  const [rutaId, setRutaId] = useState(RUTAS_DEMO[0].id)
  const [fase, setFase] = useState<Fase>("listo")
  const [cuerpo, setCuerpo] = useState<unknown>(null)
  const [resultado, setResultado] = useState<RecorridoSimulado | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [borrar, setBorrar] = useState(false)
  const [mensajeBorrado, setMensajeBorrado] = useState<string | null>(null)
  const simulacion = useSimulacion()
  const voz = useVoz()
  // Copiloto por voz del viaje en curso y los eventos que ya se anunciaron
  const guia = useRef<GuiaVozDemo | null>(null)
  const anunciados = useRef(new Set<string>())

  const ruta = RUTAS_DEMO.find((r) => r.id === rutaId) ?? RUTAS_DEMO[0]
  const geometria = useMemo(() => new GeometriaRuta(ruta.puntos), [ruta])
  const puntos = useMemo(() => ruta.puntos.map((p): LatLngTuple => [p[0], p[1]]), [ruta])
  const conductor = testers.datos?.find((t) => String(t.id) === conductorId) ?? null
  const ocupado = fase === "en_curso" || fase === "guardando"
  const estado = simulacion.estado

  // Como el Copiloto de la app: indicaciones de ruta (cortan lo que se esté diciendo) y el nombre
  // de cada evento detectado (espera su turno)
  const { hablar } = voz
  useEffect(() => {
    if (!estado || !guia.current) return
    const indicacion = guia.current.evaluar(estado.distanciaM)
    if (indicacion) hablar(indicacion, true)
    for (const e of estado.eventos) {
      const clave = `${e.tipo}-${e.t}`
      if (anunciados.current.has(clave)) continue
      anunciados.current.add(clave)
      hablar(ESTILO_EVENTO[e.tipo].nombre, false)
    }
  }, [estado, hablar])

  const iniciar = () => {
    setError(null)
    setMensajeBorrado(null)
    setResultado(null)
    guia.current = new GuiaVozDemo(ruta.pasos, geometria.largoM)
    anunciados.current = new Set()
    simulacion.iniciar(ruta)
    setFase("en_curso")
  }

  const guardar = async (datos: unknown) => {
    if (!conductor) return
    setFase("guardando")
    setError(null)
    try {
      setResultado(await crearRecorridoSimulado(conductor.id, datos))
      setCuerpo(null)
      setFase("resultado")
    } catch (e) {
      setError(e instanceof ErrorApi ? e.mensaje : ErrorApi.INESPERADO)
      setFase("resultado")
    }
  }

  const terminar = () => {
    guia.current = null
    voz.callar()
    const datos = simulacion.terminar(ruta)
    if (!datos) return
    setCuerpo(datos)
    void guardar(datos)
  }

  const nuevoViaje = () => {
    guia.current = null
    voz.callar()
    simulacion.reiniciar()
    setResultado(null)
    setCuerpo(null)
    setError(null)
    setFase("listo")
  }

  return (
    <>
      <title>Simulador de demo · DriveSense</title>
      <header>
        <p className="text-etiqueta-grande text-texto-evento-giro uppercase">Pruebas</p>
        <h1 className="mt-1 text-titulo-hero">Simulador de viajes</h1>
      </header>

      <section className="mt-6 flex items-center gap-5 rounded-3xl bg-encabezado-fondo p-6">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-advertencia/15 text-advertencia">
          <Presentation className="size-7" aria-hidden="true" />
        </span>
        <div>
          <p className="text-etiqueta-grande text-advertencia uppercase">Modo demostración</p>
          <p className="mt-1 text-titulo-tarjeta text-encabezado-texto">Los viajes de esta pantalla son simulados</p>
          <p className="mt-1 text-cuerpo text-encabezado-texto-secundario">
            Se guardan a nombre del conductor elegido, marcados como "Simulado", y cuentan en su historial y su
            DriveScore. No entran en los números de los testers.
          </p>
        </div>
      </section>

      <section className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-5 shadow-tarjeta">
        <Select value={conductorId} onValueChange={setConductorId} disabled={ocupado}>
          <SelectTrigger aria-label="Conductor" className="min-w-56">
            <Users aria-hidden="true" />
            <SelectValue placeholder={testers.cargando ? "Cargando conductores…" : "Elige el conductor"} />
          </SelectTrigger>
          <SelectContent position="popper">
            {testers.datos?.map((t) => (
              <SelectItem key={t.id} value={String(t.id)}>
                {t.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={rutaId} onValueChange={setRutaId} disabled={ocupado}>
          <SelectTrigger aria-label="Ruta" className="min-w-56">
            <MapPinned aria-hidden="true" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {RUTAS_DEMO.map((r, i) => (
              <SelectItem key={r.id} value={r.id}>
                Ruta {i + 1}: {r.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex flex-wrap gap-3">
          {fase === "en_curso" || fase === "guardando" ? (
            <Button onClick={terminar} disabled={fase === "guardando"} aria-busy={fase === "guardando"}>
              {fase === "guardando" ? <Loader2 className="animate-spin" aria-label="Guardando" /> : <Square aria-hidden="true" />}
              Terminar viaje
            </Button>
          ) : (
            <Button onClick={iniciar} disabled={!conductor || (fase === "resultado" && cuerpo !== null)}>
              <Play aria-hidden="true" />
              Iniciar viaje
            </Button>
          )}
          <Button variant="destructive" onClick={() => setBorrar(true)} disabled={!conductor || ocupado}>
            <Trash2 aria-hidden="true" />
            Borrar viajes simulados
          </Button>
        </div>
        <p className="w-full text-cuerpo-pequeno text-muted-foreground">
          {ruta.descripcion} {formatearDecimal(geometria.largoM / 1000)} km hasta {ruta.destino}.
        </p>
      </section>

      {testers.error && (
        <div className="mt-6">
          <AvisoError mensaje={testers.error} />
        </div>
      )}
      {mensajeBorrado && (
        <p
          role="status"
          className="mt-6 flex items-center gap-3 rounded-lg bg-tinte-primario px-4 py-3 text-cuerpo font-medium text-texto-exito"
        >
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
          {mensajeBorrado}
        </p>
      )}
      {error && (
        <div className="mt-6 flex flex-col gap-3">
          <AvisoError mensaje={`No se pudo guardar el viaje: ${error}`} />
          {cuerpo !== null && (
            <div className="flex gap-3">
              <Button onClick={() => void guardar(cuerpo)}>Reintentar</Button>
              <Button variant="outline" onClick={nuevoViaje}>
                Descartar el viaje
              </Button>
            </div>
          )}
        </div>
      )}

      {resultado && conductor && (
        <ResultadoDemo
          viaje={resultado}
          eventos={estado?.eventos ?? []}
          conductor={conductor.nombre}
          alNuevoViaje={nuevoViaje}
        />
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[3fr_2fr]">
        <section className="self-start rounded-xl border border-border bg-card p-5 shadow-tarjeta">
          <h2 className="mb-4 text-subtitulo-grande">Ruta</h2>
          <MapaDemo
            puntos={puntos}
            recorrido={estado ? geometria.recorrido(estado.distanciaM) : []}
            auto={estado ? [estado.lat, estado.lon] : null}
            rumbo={estado?.rumbo ?? 0}
            eventos={estado?.eventos ?? []}
          />
        </section>
        <div className="flex flex-col gap-5">
          <TarjetaCopiloto
            pasos={ruta.pasos}
            largoM={geometria.largoM}
            recorridoM={estado?.distanciaM ?? null}
            enCurso={simulacion.enCurso}
            llego={estado?.llego ?? false}
            voz={voz.activa}
            alCambiarVoz={voz.setActiva}
            vozDisponible={voz.disponible}
          />
          <TableroViaje
            estado={estado}
            enCurso={simulacion.enCurso}
            acelerar={simulacion.acelerar}
            frenar={simulacion.frenar}
            forzar={simulacion.forzar}
            motivoNoDisponible={simulacion.motivoNoDisponible}
          />
        </div>
      </div>

      <DialogoBorrarSimulados
        conductor={borrar ? conductor : null}
        alCerrar={() => setBorrar(false)}
        alBorrar={(borrados) => {
          setBorrar(false)
          setMensajeBorrado(
            borrados === 0
              ? `${conductor?.nombre} no tenía viajes simulados.`
              : `Se ${borrados === 1 ? "borró 1 viaje simulado" : `borraron ${borrados} viajes simulados`} de ${conductor?.nombre}.`,
          )
        }}
      />
    </>
  )
}
