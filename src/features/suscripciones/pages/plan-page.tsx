import { useState } from "react"
import { CalendarClock, CircleCheck, Loader2, ShieldCheck, Users } from "lucide-react"

import { AvisoError } from "@/components/error-banner"
import { TarjetaKpi } from "@/components/kpi-card"
import { useConsulta } from "@/hooks/use-consulta"
import { formatearFechaCompleta } from "@/lib/format"
import { cn } from "@/lib/utils"

import { listarPlanes } from "../api"
import { DialogoCambiarPlan } from "../components/change-plan-dialog"
import { ComparativoPlanes } from "../components/plans-comparison"
import { textoHistorial, textoPrecio } from "../format"
import { usePlan } from "../plan-context"
import type { DetallePlan } from "../types"

/** Plan de la empresa: estado, conductores usados, comparativo y cambio de plan (HU-28). */
export function PlanPagina() {
  const { plan, error, recargar } = usePlan()
  const planes = useConsulta("planes", listarPlanes)
  const [destino, setDestino] = useState<DetallePlan | null>(null)
  const [confirmado, setConfirmado] = useState<string | null>(null)

  const limite = plan?.detalle.limite_conductores ?? null
  const usados = plan?.conductores_usados ?? 0
  const porcentaje = limite ? Math.min(100, Math.round((usados / limite) * 100)) : 0
  const porVencer = plan?.estado === "por_vencer"
  const mensajeError = error ?? planes.error

  return (
    <>
      <title>Plan · DriveSense</title>
      <header>
        <p className="text-etiqueta-grande text-texto-exito uppercase">Suscripción</p>
        <h1 className="mt-1 text-titulo-hero">Plan</h1>
      </header>

      {mensajeError && (
        <div className="mt-6">
          <AvisoError mensaje={mensajeError} />
        </div>
      )}
      {!plan && !error && (
        <div className="flex justify-center py-20">
          <Loader2 className="size-8 animate-spin text-primary" aria-label="Cargando el plan" />
        </div>
      )}

      {confirmado && (
        <div
          role="status"
          className="mt-6 flex items-center gap-2 rounded-lg border border-primary/30 bg-tinte-primario p-3 text-cuerpo-pequeno text-texto-exito"
        >
          <CircleCheck className="size-5 shrink-0" aria-hidden="true" />
          <p>{confirmado}</p>
        </div>
      )}

      {plan && (
        <>
          <section className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-label="Plan actual">
            <TarjetaKpi
              etiqueta="Plan actual"
              icono={ShieldCheck}
              claseIcono="bg-tinte-primario text-texto-exito"
              valor={plan.detalle.nombre}
              detalle={`${textoPrecio(plan.detalle)}${plan.detalle.precio_bs > 0 ? " al mes" : ""} · historial ${textoHistorial(plan.detalle)}`}
            />
            <TarjetaKpi
              etiqueta="Estado"
              icono={CircleCheck}
              claseIcono={porVencer ? "bg-tinte-advertencia text-texto-evento-giro" : "bg-tinte-primario text-texto-exito"}
              valor={porVencer ? "Por vencer" : "Activo"}
              detalle={
                plan.detalle.plan === "gratis"
                  ? "El plan Gratis no vence."
                  : porVencer
                    ? "Renuévalo para no perder las funciones."
                    : "Al día."
              }
            />
            <TarjetaKpi
              etiqueta="Vencimiento"
              icono={CalendarClock}
              claseIcono="bg-tinte-secundario text-texto-evento-velocidad"
              valor={plan.fecha_vencimiento ? formatearFechaCompleta(plan.fecha_vencimiento) : "—"}
              detalle={
                plan.dias_restantes != null
                  ? plan.dias_restantes === 1
                    ? "Queda 1 día"
                    : `Quedan ${plan.dias_restantes} días`
                  : "Sin vencimiento"
              }
            />
            <TarjetaKpi
              etiqueta="Conductores"
              icono={Users}
              claseIcono="bg-tinte-confort text-texto-evento-aceleracion"
              valor={limite != null ? `${usados} de ${limite}` : usados}
              detalle={
                limite != null ? (
                  <span className="mt-1 block">
                    <span className="block h-2 overflow-hidden rounded-full bg-carril">
                      <span
                        className={cn(
                          "block h-full rounded-full",
                          porcentaje >= 100 ? "bg-peligro" : porcentaje >= 70 ? "bg-advertencia" : "bg-primario",
                        )}
                        style={{ width: `${porcentaje}%` }}
                        role="progressbar"
                        aria-valuenow={usados}
                        aria-valuemin={0}
                        aria-valuemax={limite}
                        aria-label="Conductores usados del límite"
                      />
                    </span>
                    <span className="mt-1 block">
                      {usados > limite
                        ? "Superas el límite: se conservan todos, pero no puedes registrar más."
                        : usados === limite
                          ? "Llegaste al límite."
                          : `${limite - usados} disponibles`}
                    </span>
                  </span>
                ) : (
                  "Sin tope de conductores"
                )
              }
            />
          </section>

          <section className="mt-8" aria-label="Comparar planes">
            <h2 className="text-subtitulo-grande">Compara los planes</h2>
            <p className="mt-1 mb-4 text-cuerpo text-muted-foreground">
              Cambia de plan cuando quieras. El pago es simulado: no se realiza ningún cobro. Bajar de plan nunca borra
              datos.
            </p>
            {planes.datos && (
              <ComparativoPlanes
                planes={planes.datos}
                actual={plan.detalle.plan}
                alElegir={(p) => {
                  setConfirmado(null)
                  setDestino(p)
                }}
              />
            )}
          </section>

          <DialogoCambiarPlan
            destino={destino}
            actual={plan}
            alCerrar={() => setDestino(null)}
            alCambiar={(nuevo) => {
              setConfirmado(
                nuevo.detalle.plan === "gratis" || !nuevo.fecha_vencimiento
                  ? "Tu empresa ahora está en el plan Gratis."
                  : `Listo: tu empresa está en el plan ${nuevo.detalle.nombre} hasta el ${formatearFechaCompleta(nuevo.fecha_vencimiento)}.`,
              )
              setDestino(null)
              recargar()
            }}
          />
        </>
      )}
    </>
  )
}
