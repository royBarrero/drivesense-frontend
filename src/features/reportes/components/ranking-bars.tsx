import type { ReactNode } from "react"
import { Link, useLocation } from "react-router"

import { AvatarUsuario } from "@/components/user-avatar"
import { formatearDecimal, formatearKm } from "@/lib/format"
import { NOMBRE_CALIFICACION } from "@/lib/score"
import { cn } from "@/lib/utils"

import type { ItemRanking } from "../types"

export type TipoRanking = "mejores" | "vigilar"

/**
 * Barras horizontales con los conductores de un ranking. Cada fila abre el perfil del conductor.
 * "mejores" mide el DriveScore (0–100); "vigilar", los eventos por cada 10 km (relativo al mayor).
 */
export function RankingBarras({
  titulo,
  descripcion,
  tipo,
  items,
  vacio,
}: {
  titulo: string
  descripcion: string
  tipo: TipoRanking
  items: ItemRanking[]
  /** Qué mostrar cuando nadie entra en el ranking. */
  vacio: ReactNode
}) {
  const { pathname, search } = useLocation()
  const mayor = Math.max(...items.map((i) => i.eventos_por_10km ?? 0), 0)

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <h2 className="text-subtitulo-grande">{titulo}</h2>
      <p className="mt-1 text-cuerpo text-muted-foreground">{descripcion}</p>

      {items.length === 0 ? (
        <p className="mt-4 rounded-lg bg-muted px-4 py-6 text-center text-cuerpo text-muted-foreground">{vacio}</p>
      ) : (
        <ol className="mt-3 flex flex-col">
          {items.map((i) => {
            const eventos10 = i.eventos_por_10km ?? 0
            const porcentaje = tipo === "mejores" ? i.drivescore : mayor > 0 ? (eventos10 / mayor) * 100 : 0
            const valor = tipo === "mejores" ? String(i.drivescore) : formatearDecimal(eventos10)
            const detalle =
              tipo === "mejores"
                ? `${NOMBRE_CALIFICACION[i.calificacion]} · ${formatearKm(i.distancia_m)}`
                : `${i.eventos} ${i.eventos === 1 ? "evento" : "eventos"} en ${formatearKm(i.distancia_m)}`
            return (
              <li key={i.id}>
                <Link
                  to={`/panel/conductores/${i.id}`}
                  state={{ volver: `${pathname}${search}`, volverTexto: "Volver a reportes" }}
                  className="flex items-center gap-3 rounded-lg p-2 outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <AvatarUsuario id={i.id} nombre={i.nombre} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-cuerpo font-medium">{i.nombre}</span>
                      <span className="shrink-0 font-numeros text-numero-metrica tabular-nums">
                        {valor}
                        {tipo === "vigilar" && <span className="ml-1 text-ayuda text-muted-foreground">por 10 km</span>}
                      </span>
                    </span>
                    <span
                      className="mt-1.5 block h-2 overflow-hidden rounded-full bg-carril"
                      role="img"
                      aria-label={`${i.nombre}: ${valor}${tipo === "vigilar" ? " eventos por cada 10 km" : " de DriveScore"}`}
                    >
                      <span
                        className={cn("block h-full rounded-full", tipo === "mejores" ? "bg-primario" : "bg-advertencia")}
                        style={{ width: `${Math.max(porcentaje, 2)}%` }}
                      />
                    </span>
                    <span className="mt-1 block text-ayuda text-muted-foreground">{detalle}</span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
