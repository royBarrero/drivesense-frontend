import {
  ClipboardCheck,
  FileText,
  ShieldAlert,
  Smartphone,
  TrendingUp,
  UserCheck,
  type LucideIcon,
} from "lucide-react"

// Textos propuestos (docs/diseno.md, 8): se pueden cambiar sin tocar el diseño
const PUBLICOS: {
  id: string
  titulo: string
  descripcion: string
  beneficios: { texto: string; Icono: LucideIcon }[]
}[] = [
  {
    id: "para-flotas",
    titulo: "Para flotas",
    descripcion: "Empresas de transporte y reparto.",
    beneficios: [
      { texto: "Detecta a tiempo los hábitos de riesgo de cada conductor.", Icono: ShieldAlert },
      { texto: "Compara el desempeño entre conductores y periodos.", Icono: TrendingUp },
      { texto: "Sin instalar dispositivos en los vehículos.", Icono: Smartphone },
    ],
  },
  {
    id: "para-aseguradoras",
    titulo: "Para aseguradoras",
    descripcion: "Compañías de seguros.",
    beneficios: [
      { texto: "Evalúa el riesgo con datos reales de conducción.", Icono: ClipboardCheck },
      { texto: "Consulta el perfil de riesgo de cada conductor.", Icono: UserCheck },
      { texto: "Reportes para respaldar tus decisiones.", Icono: FileText },
    ],
  },
]

/** Bloques breves "Para flotas" y "Para aseguradoras" (destino de los enlaces de la barra). */
export function SeccionesPublico() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {PUBLICOS.map((p) => (
        <section
          key={p.id}
          id={p.id}
          aria-labelledby={`${p.id}-titulo`}
          className="scroll-mt-6 rounded-xl border border-border bg-card p-6 shadow-tarjeta sm:p-8"
        >
          <h2 id={`${p.id}-titulo`} className="text-titulo">
            {p.titulo}
          </h2>
          <p className="mt-1 text-cuerpo text-muted-foreground">{p.descripcion}</p>
          <ul className="mt-5 flex flex-col gap-3">
            {p.beneficios.map(({ texto, Icono }) => (
              <li key={texto} className="flex items-start gap-3 text-cuerpo">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-tinte-primario">
                  <Icono className="size-4 text-primario-oscuro" aria-hidden="true" />
                </span>
                <span className="pt-1.5">{texto}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
