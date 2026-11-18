import { ChartColumn, Smartphone, UserPlus, type LucideIcon } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"

const PASOS: { titulo: string; texto: string; icono: LucideIcon }[] = [
  {
    titulo: "Registra a tus conductores",
    texto: "En Conductores, con su nombre, correo y teléfono. Cada uno recibe una contraseña temporal.",
    icono: UserPlus,
  },
  {
    titulo: "Ellos ingresan desde la app",
    texto: "Inician sesión en la app de DriveSense y registran sus viajes con los sensores del teléfono.",
    icono: Smartphone,
  },
  {
    titulo: "Revisa su desempeño aquí",
    texto: "DriveScore, eventos de riesgo y reportes de toda la flota, actualizados con cada viaje.",
    icono: ChartColumn,
  },
]

/** Primeros pasos para una empresa que todavía no tiene conductores. */
export function PrimerosPasos() {
  return (
    <section className="rounded-xl border border-border bg-card p-6 shadow-tarjeta lg:p-8">
      <p className="text-etiqueta-grande text-texto-exito uppercase">Primeros pasos</p>
      <h2 className="mt-1 text-titulo">Pon en marcha tu flota en tres pasos</h2>
      <ol className="mt-6 grid gap-6 md:grid-cols-3">
        {PASOS.map(({ titulo, texto, icono: Icono }, i) => (
          <li key={titulo} className="flex gap-4">
            <span className="relative flex size-12 shrink-0 items-center justify-center rounded-full bg-tinte-primario text-texto-exito">
              <Icono className="size-5" aria-hidden="true" />
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary font-numeros text-ayuda text-primary-foreground">
                {i + 1}
              </span>
            </span>
            <span>
              <span className="block text-subtitulo font-semibold">{titulo}</span>
              <span className="mt-1 block text-cuerpo-pequeno text-muted-foreground">{texto}</span>
            </span>
          </li>
        ))}
      </ol>
      <Button asChild className="mt-8">
        <Link to="/panel/conductores">
          <UserPlus aria-hidden="true" />
          Registrar el primer conductor
        </Link>
      </Button>
    </section>
  )
}
