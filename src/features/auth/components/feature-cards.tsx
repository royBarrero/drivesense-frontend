import { FileDown, Gauge, TriangleAlert, type LucideIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface Caracteristica {
  titulo: string
  texto: string
  Icono: LucideIcon
  fondo: string
  colorIcono: string
}

const CARACTERISTICAS: Caracteristica[] = [
  {
    titulo: "DriveScore por conductor",
    texto: "Puntaje de 0 a 100 por viaje, con el desglose de velocidad, frenadas, aceleraciones y giros.",
    Icono: Gauge,
    fondo: "bg-tinte-primario",
    colorIcono: "text-primario-oscuro",
  },
  {
    titulo: "Historial de eventos de riesgo",
    texto: "Cada frenada brusca, aceleración severa, giro agresivo o exceso de velocidad, con su fecha.",
    Icono: TriangleAlert,
    fondo: "bg-tinte-peligro",
    colorIcono: "text-peligro",
  },
  {
    titulo: "Reportes exportables",
    texto: "Descarga el desempeño de tus conductores para compartirlo o archivarlo.",
    Icono: FileDown,
    fondo: "bg-tinte-confort",
    colorIcono: "text-confort",
  },
]

/** Micro-tarjetas tintadas de la sección "Cómo funciona". */
export function TarjetasCaracteristicas() {
  return (
    <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1">
      {CARACTERISTICAS.map(({ titulo, texto, Icono, fondo, colorIcono }) => (
        <li key={titulo} className={cn("flex gap-4 rounded-lg border border-border p-4 shadow-tarjeta", fondo)}>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-card">
            <Icono className={cn("size-5", colorIcono)} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-subtitulo">{titulo}</span>
            <span className="mt-1 block text-cuerpo-pequeno text-muted-foreground">{texto}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
