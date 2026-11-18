import { ArrowRight, Building2, Sparkles, UserPlus, Users } from "lucide-react"
import { Link } from "react-router"

import { AnilloDriveScore } from "@/components/score-ring"
import { Button } from "@/components/ui/button"
import type { UsuarioAdmin } from "@/features/auth/types"
import type { TableroFlota } from "@/features/reportes/types"
import { formatearEntero, formatearKm, primerNombre } from "@/lib/format"
import { CLASE_CALIFICACION, NOMBRE_CALIFICACION } from "@/lib/score"
import { cn } from "@/lib/utils"

/** Mismos tramos que la app: < 12 días, < 19 tardes, si no noches. */
function saludo(hora = new Date().getHours()) {
  if (hora < 12) return "Buenos días"
  if (hora < 19) return "Buenas tardes"
  return "Buenas noches"
}

function resumen(t: TableroFlota | null) {
  if (!t) return "Preparando el resumen de tu flota…"
  if (t.conductores === 0) return "Empecemos: registra a tus conductores y aquí verás cómo manejan."
  if (t.viajes === 0) return "Tus conductores no tienen viajes finalizados en los últimos 7 días."
  return (
    `En los últimos 7 días tu flota recorrió ${formatearKm(t.distancia_m)} en ` +
    `${formatearEntero(t.viajes)} ${t.viajes === 1 ? "viaje" : "viajes"}.`
  )
}

/**
 * Bloque oscuro de bienvenida del Inicio (docs/diseno.md, 8.9): saludo, empresa y plan,
 * resumen de la semana y el anillo con el DriveScore de la flota sobre la diana de fuerzas G.
 */
export function BloqueBienvenida({
  usuario,
  nombrePlan,
  tablero,
}: {
  usuario: UsuarioAdmin | null
  nombrePlan: string | null
  tablero: TableroFlota | null
}) {
  const sinConductores = tablero?.conductores === 0
  const drivescore = tablero && tablero.viajes > 0 ? tablero.drivescore : null

  return (
    <section className="relative overflow-hidden rounded-3xl bg-encabezado-fondo shadow-tarjeta-elevada">
      <RutaDecorativa />

      <div className="relative grid gap-10 px-6 py-8 md:px-10 md:py-10 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-12 lg:px-12 lg:py-12">
        <div className="max-w-170">
          <div className="flex flex-wrap items-center gap-2">
            {usuario?.empresa && (
              <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-encabezado-borde px-3 text-cuerpo-pequeno text-encabezado-texto">
                <Building2 className="size-4 text-encabezado-texto-secundario" aria-hidden="true" />
                {usuario.empresa.nombre}
                <span className="text-encabezado-texto-secundario">
                  · {usuario.empresa.tipo === "aseguradora" ? "Aseguradora" : "Flota"}
                </span>
              </span>
            )}
            {nombrePlan && (
              <Link
                to="/panel/plan"
                className="inline-flex min-h-8 items-center gap-2 rounded-full bg-encabezado-acento/12 px-3 text-etiqueta-grande text-encabezado-acento outline-none hover:bg-encabezado-acento/20 focus-visible:ring-3 focus-visible:ring-encabezado-acento/50"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                Plan {nombrePlan}
              </Link>
            )}
          </div>

          <p className="mt-6 text-etiqueta-grande text-encabezado-acento uppercase">{saludo()}</p>
          <h1 className="mt-2 text-titulo-landing-movil text-encabezado-texto">
            {primerNombre(usuario?.nombre ?? "")}
          </h1>
          <p className="mt-3 max-w-150 text-subtitulo-landing text-encabezado-texto-secundario">{resumen(tablero)}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {sinConductores ? (
              <Button asChild variant="sobreOscuro" size="lg">
                <Link to="/panel/conductores">
                  <UserPlus aria-hidden="true" />
                  Registrar conductores
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="sobreOscuro" size="lg">
                  <Link to="/panel/reportes?periodo=7d">
                    Ver reportes
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button asChild variant="contornoOscuro" size="lg">
                  <Link to="/panel/conductores">
                    <Users aria-hidden="true" />
                    Conductores
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Anillo sobre los círculos de la diana */}
        <div className="relative mx-auto flex size-80 shrink-0 flex-col items-center justify-center">
          <svg
            viewBox="0 0 320 320"
            className="absolute inset-0 size-full stroke-encabezado-borde"
            fill="none"
            strokeWidth="1"
            aria-hidden="true"
          >
            {/* Relleno del fondo: la ruta decorativa no cruza por detrás del número */}
            <circle cx="160" cy="160" r="112" strokeDasharray="4 5" className="fill-encabezado-fondo" />
            <circle cx="160" cy="160" r="150" />
            <line x1="0" y1="160" x2="40" y2="160" />
            <line x1="280" y1="160" x2="320" y2="160" />
            <line x1="160" y1="0" x2="160" y2="40" />
            <line x1="160" y1="280" x2="160" y2="320" />
          </svg>
          <AnilloDriveScore drivescore={drivescore} etiqueta="DriveScore · 7 días" sobreOscuro />
          <span
            className={cn(
              "absolute bottom-6 inline-flex min-h-7 items-center rounded-full px-3 text-etiqueta-grande",
              tablero?.calificacion && drivescore !== null
                ? CLASE_CALIFICACION[tablero.calificacion]
                : "bg-encabezado-superficie text-encabezado-texto-secundario",
            )}
          >
            {tablero?.calificacion && drivescore !== null ? NOMBRE_CALIFICACION[tablero.calificacion] : "Sin viajes"}
          </span>
        </div>
      </div>
    </section>
  )
}

/** Ruta punteada que cruza el bloque, como en la landing (decorativa). */
function RutaDecorativa() {
  return (
    <svg
      viewBox="0 0 1200 420"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 size-full"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M -20 400 C 260 410, 520 360, 700 250 S 1020 40, 1220 20"
        className="stroke-encabezado-acento"
        strokeOpacity="0.35"
        strokeWidth="2"
        strokeDasharray="6 7"
        strokeLinecap="round"
      />
    </svg>
  )
}
