import { ArrowRight, ChartColumn, CreditCard, Users, type LucideIcon } from "lucide-react"
import { Link } from "react-router"

import { cn } from "@/lib/utils"

const ACCESOS: { ruta: string; titulo: string; texto: string; icono: LucideIcon; claseIcono: string }[] = [
  {
    ruta: "/panel/conductores",
    titulo: "Conductores",
    texto: "Registra, busca y revisa el perfil de riesgo de cada conductor.",
    icono: Users,
    claseIcono: "bg-tinte-primario text-texto-exito",
  },
  {
    ruta: "/panel/reportes",
    titulo: "Reportes",
    texto: "Rankings, eventos por tipo y la evolución del DriveScore de la flota.",
    icono: ChartColumn,
    claseIcono: "bg-tinte-secundario text-texto-evento-velocidad",
  },
  {
    ruta: "/panel/plan",
    titulo: "Plan",
    texto: "Tu plan actual, sus límites y las funciones de cada plan.",
    icono: CreditCard,
    claseIcono: "bg-tinte-confort text-texto-evento-aceleracion",
  },
]

/** Tarjetas-enlace a las secciones del panel. */
export function AccesosRapidos() {
  return (
    <section aria-labelledby="accesos-titulo">
      <h2 id="accesos-titulo" className="text-etiqueta-grande text-muted-foreground uppercase">
        Accesos rápidos
      </h2>
      <div className="mt-3 grid gap-5 md:grid-cols-3">
        {ACCESOS.map(({ ruta, titulo, texto, icono: Icono, claseIcono }) => (
          <Link
            key={ruta}
            to={ruta}
            className="group flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-tarjeta outline-none transition-all hover:-translate-y-0.5 hover:border-borde-fuerte focus-visible:ring-3 focus-visible:ring-ring/50 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
          >
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-md", claseIcono)}>
              <Icono className="size-5" aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2 text-subtitulo font-semibold">
                {titulo}
                <ArrowRight
                  className="size-4 text-texto-terciario transition-transform group-hover:translate-x-0.5 group-hover:text-enlace motion-reduce:transition-none"
                  aria-hidden="true"
                />
              </span>
              <span className="mt-1 block text-cuerpo-pequeno text-muted-foreground">{texto}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
