import { Activity, Route, TriangleAlert, Waypoints } from "lucide-react"
import { useState } from "react"

import { AvisoError } from "@/components/error-banner"
import { TarjetaKpi } from "@/components/kpi-card"
import { useSesion } from "@/features/auth/session-context"
import { useAccesoPruebas } from "@/features/pruebas/access-context"
import { SeccionPruebasInicio } from "@/features/pruebas/components/home-tests-section"
import { SelectorPeriodo } from "@/features/pruebas/components/period-select"
import type { Periodo } from "@/features/pruebas/period"
import { obtenerTablero } from "@/features/reportes/api"
import { FuncionBloqueada } from "@/features/suscripciones/components/locked-feature"
import { usePlan } from "@/features/suscripciones/plan-context"
import { useConsulta } from "@/hooks/use-consulta"
import { formatearDecimal, formatearEntero, formatearKm } from "@/lib/format"

import { BloqueBienvenida } from "./home/home-hero"
import { TopConductores } from "./home/home-rankings"
import { AccesosRapidos } from "./home/quick-links"
import { PrimerosPasos } from "./home/welcome-steps"

/**
 * Inicio del panel: bienvenida con el DriveScore de la flota en los últimos 7 días, sus
 * indicadores, los conductores destacados y a vigilar y accesos rápidos. Con la cuenta de
 * pruebas muestra además el modo pruebas (temporal).
 */
export function InicioPagina() {
  const { usuario } = useSesion()
  const { plan } = usePlan()
  const acceso = useAccesoPruebas()
  const [periodoPruebas, setPeriodoPruebas] = useState<Periodo>("7d")

  const tablero = useConsulta("inicio:tablero:7d", () => obtenerTablero("7d"))
  const t = tablero.datos

  return (
    <>
      <title>Inicio · DriveSense</title>
      <div className="flex flex-col gap-8">
        <BloqueBienvenida usuario={usuario} nombrePlan={plan?.detalle.nombre ?? null} tablero={t} />

        {tablero.error && <AvisoError mensaje={tablero.error} />}

        {t && t.conductores === 0 && <PrimerosPasos />}

        {t && t.conductores > 0 && t.viajes > 0 && (
          <>
            <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="La flota esta semana">
              <TarjetaKpi
                etiqueta="Viajes"
                icono={Waypoints}
                claseIcono="bg-tinte-primario text-texto-exito"
                valor={formatearEntero(t.viajes)}
                detalle={`De ${t.conductores_con_viajes} de ${t.conductores} ${t.conductores === 1 ? "conductor" : "conductores"}`}
              />
              <TarjetaKpi
                etiqueta="Kilómetros"
                icono={Route}
                claseIcono="bg-tinte-secundario text-texto-evento-velocidad"
                valor={formatearKm(t.distancia_m)}
                detalle="Recorridos en los últimos 7 días"
              />
              <TarjetaKpi
                etiqueta="Eventos por cada 10 km"
                icono={Activity}
                claseIcono="bg-tinte-advertencia text-texto-evento-giro"
                valor={t.eventos_por_10km != null ? formatearDecimal(t.eventos_por_10km) : "—"}
                detalle={`${formatearEntero(t.eventos)} ${t.eventos === 1 ? "evento" : "eventos"} en total`}
              />
              <TarjetaKpi
                etiqueta="Conductores en riesgo"
                icono={TriangleAlert}
                claseIcono="bg-tinte-peligro text-destructive"
                valor={formatearEntero(t.conductores_en_riesgo)}
                detalle="Con DriveScore menor a 60"
              />
            </section>

            {/* Sin nadie que supere la distancia mínima, los rankings vacíos solo restan */}
            {t.completo && t.mejores.length + t.a_vigilar.length === 0 ? null : t.completo ? (
              <section className="grid gap-5 lg:grid-cols-2" aria-label="Conductores de la semana">
                <TopConductores
                  tipo="mejores"
                  items={t.mejores}
                  vacio={`Ningún conductor supera ${formatearKm(t.distancia_minima_ranking_m)} esta semana.`}
                />
                <TopConductores
                  tipo="vigilar"
                  items={t.a_vigilar}
                  vacio={
                    t.mejores.length > 0
                      ? "Ningún conductor tuvo eventos de riesgo esta semana. ¡Buen trabajo!"
                      : `Ningún conductor supera ${formatearKm(t.distancia_minima_ranking_m)} esta semana.`
                  }
                />
              </section>
            ) : (
              <FuncionBloqueada titulo="Conductores destacados y a vigilar" compacto>
                Mejora tu plan para ver cada semana quiénes manejan mejor y a quiénes conviene acompañar.
              </FuncionBloqueada>
            )}
          </>
        )}

        <AccesosRapidos />

        {acceso && (
          <section className="flex flex-col gap-4" aria-label="Modo pruebas">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <h2 className="text-subtitulo-grande">Modo pruebas</h2>
              <SelectorPeriodo valor={periodoPruebas} alCambiar={setPeriodoPruebas} />
            </div>
            <SeccionPruebasInicio periodo={periodoPruebas} aside={null} />
          </section>
        )}
      </div>
    </>
  )
}
