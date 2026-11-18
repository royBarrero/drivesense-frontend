import { ArrowRight, ShieldAlert, Trophy, type LucideIcon } from "lucide-react"
import { Link } from "react-router"

import { DistintivoPuntaje } from "@/components/score-badge"
import { AvatarUsuario } from "@/components/user-avatar"
import type { ItemRanking } from "@/features/reportes/types"
import { formatearDecimal, formatearKm } from "@/lib/format"
import { NOMBRE_CALIFICACION } from "@/lib/score"
import { cn } from "@/lib/utils"

const CANTIDAD = 3

/** Los 3 primeros de un ranking del tablero; cada fila abre el perfil del conductor. */
export function TopConductores({
  tipo,
  items,
  vacio,
}: {
  tipo: "mejores" | "vigilar"
  items: ItemRanking[]
  vacio: string
}) {
  const mejores = tipo === "mejores"
  const Icono: LucideIcon = mejores ? Trophy : ShieldAlert

  return (
    <section className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-md",
            mejores ? "bg-tinte-primario text-texto-exito" : "bg-tinte-advertencia text-texto-evento-giro",
          )}
        >
          <Icono className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h2 className="text-subtitulo-grande">{mejores ? "Conductores destacados" : "Conductores a vigilar"}</h2>
          <p className="text-cuerpo-pequeno text-muted-foreground">
            {mejores ? "Mejor DriveScore de la semana." : "Más eventos de riesgo por cada 10 km."}
          </p>
        </div>
      </div>

      {items.length === 0 ? (
        <p className="mt-4 flex-1 rounded-lg bg-muted px-4 py-6 text-center text-cuerpo text-muted-foreground">{vacio}</p>
      ) : (
        <ol className="mt-3 flex flex-1 flex-col">
          {items.slice(0, CANTIDAD).map((i, posicion) => (
            <li key={i.id}>
              <Link
                to={`/panel/conductores/${i.id}`}
                state={{ volver: "/panel", volverTexto: "Volver al inicio" }}
                className="flex items-center gap-3 rounded-lg p-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="w-4 text-center font-numeros text-cuerpo-pequeno text-texto-terciario">
                  {posicion + 1}
                </span>
                <AvatarUsuario id={i.id} nombre={i.nombre} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-cuerpo font-medium">{i.nombre}</span>
                  <span className="block text-ayuda text-muted-foreground">
                    {mejores
                      ? `${NOMBRE_CALIFICACION[i.calificacion]} · ${formatearKm(i.distancia_m)}`
                      : `${i.eventos} ${i.eventos === 1 ? "evento" : "eventos"} en ${formatearKm(i.distancia_m)}`}
                  </span>
                </span>
                {mejores ? (
                  <DistintivoPuntaje drivescore={i.drivescore} calificacion={i.calificacion} />
                ) : (
                  <span className="shrink-0 text-right">
                    <span className="block font-numeros text-numero-metrica tabular-nums">
                      {formatearDecimal(i.eventos_por_10km ?? 0)}
                    </span>
                    <span className="block text-ayuda text-muted-foreground">por 10 km</span>
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ol>
      )}

      <Link
        to="/panel/reportes?periodo=7d"
        className="mt-3 inline-flex items-center gap-1 self-start text-cuerpo-pequeno font-semibold text-enlace hover:underline"
      >
        Ver el ranking completo
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </section>
  )
}
