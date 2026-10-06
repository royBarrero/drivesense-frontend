import { useState, type ReactNode } from "react"
import { BarChart3, Users } from "lucide-react"

import { useSesion } from "@/features/auth/session-context"
import { useAccesoPruebas } from "@/features/pruebas/access-context"
import { SeccionPruebasInicio } from "@/features/pruebas/components/home-tests-section"
import { SelectorPeriodo } from "@/features/pruebas/components/period-select"
import type { Periodo } from "@/features/pruebas/period"
import { primerNombre } from "@/lib/format"

/** Mismos tramos que la app: < 12 días, < 19 tardes, si no noches. */
function saludo(hora = new Date().getHours()) {
  if (hora < 12) return "Buenos días"
  if (hora < 19) return "Buenas tardes"
  return "Buenas noches"
}

/** Inicio del panel. Con la cuenta de pruebas muestra además el modo pruebas (temporal). */
export function InicioPagina() {
  const { usuario } = useSesion()
  const acceso = useAccesoPruebas()
  const [periodo, setPeriodo] = useState<Periodo>("7d")

  return (
    <>
      <title>Inicio · DriveSense</title>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-subtitulo text-muted-foreground">{saludo()},</p>
          <h1 className="text-titulo-hero">{primerNombre(usuario?.nombre ?? "")}</h1>
        </div>
        {acceso && <SelectorPeriodo valor={periodo} alCambiar={setPeriodo} />}
      </header>

      {acceso ? (
        <SeccionPruebasInicio periodo={periodo} aside={<Proximamente />} />
      ) : (
        <div className="mt-8 max-w-xl">
          <Proximamente />
        </div>
      )}
    </>
  )
}

function Proximamente() {
  return (
    <section className="h-fit rounded-xl border border-dashed border-borde-fuerte bg-muted p-5">
      <h2 className="text-subtitulo-grande">Próximamente</h2>
      <ul className="mt-4 flex flex-col gap-5">
        <ItemProximo icono={<Users className="size-5" />} titulo="Conductores de tu flota">
          Registra conductores y revisa el DriveScore de cada uno.
        </ItemProximo>
        <ItemProximo icono={<BarChart3 className="size-5" />} titulo="Reportes">
          Desempeño por conductor y por periodo, exportable.
        </ItemProximo>
      </ul>
    </section>
  )
}

function ItemProximo({ icono, titulo, children }: { icono: ReactNode; titulo: string; children: string }) {
  return (
    <li className="flex gap-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">
        {icono}
      </span>
      <span>
        <span className="block text-subtitulo">{titulo}</span>
        <span className="block text-cuerpo text-muted-foreground">{children}</span>
      </span>
    </li>
  )
}
