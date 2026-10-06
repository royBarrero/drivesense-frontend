import type { ReactNode } from "react"
import { ArrowRight, BarChart3, FlaskConical, Gauge, Route, TriangleAlert } from "lucide-react"
import { Link } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { formatearDecimal, formatearEntero, formatearFechaHora, formatearKm } from "@/lib/format"
import { NOMBRE_CALIFICACION } from "@/lib/score"

import { listarRecorridos, obtenerResumen } from "../api"
import { desdePeriodo, FRENTE_A, type Periodo } from "../period"
import { useConsulta } from "../use-query"
import { DistintivoPuntaje } from "./badges"
import { TarjetaKpi } from "./kpi-card"
import { AvatarTester } from "./tester-avatar"

/** Modo pruebas en Inicio (temporal): KPIs de todos los testers, banner y últimos viajes. */
export function SeccionPruebasInicio({ periodo, aside }: { periodo: Periodo; aside: ReactNode }) {
  const desde = desdePeriodo(periodo)
  const resumen = useConsulta(`resumen:${desde}`, () => obtenerResumen(desde))
  const ultimos = useConsulta(`ultimos:${desde}`, () => listarRecorridos({ desde }, 1, 4))
  const r = resumen.datos

  return (
    <>
      {resumen.error && (
        <div className="mt-6">
          <AvisoError mensaje={resumen.error} />
        </div>
      )}

      <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Resumen de los viajes">
        <TarjetaKpi
          etiqueta="Viajes registrados"
          icono={Route}
          claseIcono="bg-tinte-primario text-texto-exito"
          cargando={resumen.cargando}
          valor={r ? formatearEntero(r.viajes) : "—"}
          detalle={r && textoComparacion(r.viajes, r.viajes_anterior, periodo)}
        />
        <TarjetaKpi
          etiqueta="Kilómetros"
          icono={Gauge}
          claseIcono="bg-tinte-secundario text-texto-evento-velocidad"
          cargando={resumen.cargando}
          valor={r ? formatearEntero(r.distancia_m / 1000) : "—"}
          detalle="En todos los viajes"
        />
        <TarjetaKpi
          etiqueta="DriveScore promedio"
          icono={BarChart3}
          claseIcono="bg-tinte-confort text-texto-evento-aceleracion"
          cargando={resumen.cargando}
          valor={r?.drivescore_promedio ?? "—"}
          detalle={r && (r.calificacion ? NOMBRE_CALIFICACION[r.calificacion] : "Sin viajes con puntaje")}
        />
        <TarjetaKpi
          etiqueta="Eventos detectados"
          icono={TriangleAlert}
          claseIcono="bg-tinte-peligro text-texto-evento-frenada"
          cargando={resumen.cargando}
          valor={r ? formatearEntero(r.eventos) : "—"}
          detalle={r?.eventos_por_10km != null && `${formatearDecimal(r.eventos_por_10km)} por cada 10 km`}
        />
      </section>

      <section className="relative mt-8 flex flex-col gap-5 overflow-hidden rounded-3xl bg-encabezado-fondo p-6 sm:flex-row sm:items-center lg:px-8">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-advertencia/15 text-advertencia">
          <FlaskConical className="size-7" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-etiqueta-grande text-advertencia uppercase">Modo pruebas activo</p>
          <p className="mt-1 text-titulo-tarjeta text-encabezado-texto">
            {r ? `${plural(r.testers, "tester", "testers")} ${r.testers === 1 ? "registró" : "registraron"} ${plural(r.viajes, "viaje", "viajes")}` : "Viajes de los testers"}
          </p>
          <p className="mt-1 text-cuerpo text-encabezado-texto-secundario">
            Revisa qué detectó la app en cada viaje: velocidad máxima, frenadas, aceleraciones, giros y excesos.
          </p>
        </div>
        <Button variant="sobreOscuro" size="lg" asChild>
          <Link to={`/panel/pruebas?periodo=${periodo}`}>
            Abrir Pruebas
            <ArrowRight />
          </Link>
        </Button>
      </section>

      <div className="mt-8 grid gap-5 xl:grid-cols-[3fr_2fr]">
        <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <h2 className="text-subtitulo-grande">Últimos viajes</h2>
            <Link
              to={`/panel/pruebas?periodo=${periodo}`}
              className="text-cuerpo font-semibold text-enlace hover:underline"
            >
              Ver todos
            </Link>
          </div>
          {ultimos.error && (
            <div className="mt-4">
              <AvisoError mensaje={ultimos.error} />
            </div>
          )}
          {ultimos.datos?.recorridos.length === 0 && (
            <p className="py-8 text-center text-cuerpo text-muted-foreground">Todavía no hay viajes en este periodo.</p>
          )}
          <ul className="divide-y divide-border">
            {ultimos.datos?.recorridos.map((v) => (
              <li key={v.id}>
                <Link
                  to={`/panel/pruebas/viajes/${v.id}`}
                  className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 hover:bg-muted"
                >
                  <AvatarTester id={v.conductor.id} nombre={v.conductor.nombre} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-subtitulo">{v.conductor.nombre}</span>
                    <span className="block truncate text-cuerpo-pequeno text-muted-foreground">
                      {formatearFechaHora(v.fecha_inicio)} · {formatearKm(v.distancia_m)}
                    </span>
                  </span>
                  <DistintivoPuntaje drivescore={v.drivescore} calificacion={v.calificacion} estado={v.estado} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
        {aside}
      </div>
    </>
  )
}

function plural(cantidad: number, singular: string, varios: string) {
  return `${formatearEntero(cantidad)} ${cantidad === 1 ? singular : varios}`
}

function textoComparacion(viajes: number, anterior: number | null, periodo: Periodo) {
  if (periodo === "todo" || anterior === null) return "Desde el primer viaje"
  const diferencia = viajes - anterior
  const signo = diferencia > 0 ? "+" : ""
  return `${signo}${formatearEntero(diferencia)} ${FRENTE_A[periodo]}`
}
