import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { textoHistorial, textoLimite, textoPrecio } from "../format"
import type { DetallePlan, IdPlan } from "../types"

const ORDEN: IdPlan[] = ["gratis", "premium", "empresas"]

function Caracteristica({ incluida, children }: { incluida: boolean; children: React.ReactNode }) {
  const Icono = incluida ? Check : X
  return (
    <li className={cn("flex items-start gap-2 text-cuerpo", !incluida && "text-texto-terciario")}>
      <Icono
        className={cn("mt-0.5 size-4 shrink-0", incluida ? "text-texto-exito" : "text-texto-terciario")}
        aria-label={incluida ? "Incluido" : "No incluido"}
      />
      <span>{children}</span>
    </li>
  )
}

/** Comparativo de los planes; el actual va marcado y el resto ofrece cambiar. */
export function ComparativoPlanes({
  planes,
  actual,
  alElegir,
}: {
  planes: DetallePlan[]
  actual: IdPlan
  alElegir: (plan: DetallePlan) => void
}) {
  const ordenados = [...planes].sort((a, b) => ORDEN.indexOf(a.plan) - ORDEN.indexOf(b.plan))
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {ordenados.map((p) => {
        const esActual = p.plan === actual
        const subida = ORDEN.indexOf(p.plan) > ORDEN.indexOf(actual)
        return (
          <article
            key={p.plan}
            className={cn(
              "flex flex-col rounded-xl border bg-card p-5 shadow-tarjeta",
              esActual ? "border-primary ring-1 ring-primary" : "border-border",
            )}
            aria-label={`Plan ${p.nombre}`}
          >
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-subtitulo-grande">{p.nombre}</h3>
              {esActual && (
                <span className="rounded-full bg-tinte-primario px-2.5 py-0.5 text-ayuda font-semibold text-texto-exito">
                  Tu plan
                </span>
              )}
            </div>
            <p className="mt-3 font-numeros text-puntaje tabular-nums">
              {textoPrecio(p)}
              {p.precio_bs > 0 && <span className="ml-1 text-cuerpo font-normal text-muted-foreground">/ mes</span>}
            </p>
            <ul className="mt-5 flex flex-1 flex-col gap-2.5">
              <Caracteristica incluida>{textoLimite(p)}</Caracteristica>
              <Caracteristica incluida>Historial {textoHistorial(p)}</Caracteristica>
              <Caracteristica incluida={p.funciones.eventos_mapa_patrones}>Eventos con mapa y patrones</Caracteristica>
              <Caracteristica incluida={p.funciones.tablero_completo}>Reportes completos de la flota</Caracteristica>
              <Caracteristica incluida={p.funciones.exportar}>Exportar reportes en PDF y CSV</Caracteristica>
            </ul>
            <Button
              className="mt-6"
              variant={subida ? "default" : "outline"}
              disabled={esActual && p.plan === "gratis"}
              onClick={() => alElegir(p)}
            >
              {esActual
                ? p.plan === "gratis"
                  ? "Plan actual"
                  : "Renovar un mes"
                : subida
                  ? `Cambiar a ${p.nombre}`
                  : `Bajar a ${p.nombre}`}
            </Button>
          </article>
        )
      })}
    </div>
  )
}
