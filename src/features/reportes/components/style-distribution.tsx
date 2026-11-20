import { CapsulaIA } from "@/components/ai-badge"
import { ESTILO_CONDUCCION, ESTILOS_POR_RIESGO } from "@/features/conductores/driving-style"
import type { EstiloConduccion } from "@/features/conductores/types"
import { cn } from "@/lib/utils"

/**
 * Cuántos conductores hay en cada estilo de conducción (HU-25), de menor a mayor riesgo.
 * Usa los últimos 30 días, así que no cambia con el periodo del tablero.
 */
export function DistribucionEstilos({ conteo }: { conteo: Record<EstiloConduccion, number> }) {
  const mayor = Math.max(...ESTILOS_POR_RIESGO.map((e) => conteo[e]), 1)
  const conEstilo = ESTILOS_POR_RIESGO.reduce((total, e) => total + conteo[e], 0)
  const sinDatos = conteo.sin_datos

  return (
    <section className="rounded-xl border border-border bg-card p-5 shadow-tarjeta">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-subtitulo-grande">Conductores por estilo</h2>
        <CapsulaIA titulo="Calculado por la IA del sistema comparando los viajes de muchos conductores" />
      </div>
      <p className="mt-1 text-cuerpo text-muted-foreground">
        De menor a mayor riesgo, con los últimos 30 días (no depende del periodo).
      </p>

      {conEstilo === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-borde-fuerte bg-muted px-4 py-8 text-center text-cuerpo text-muted-foreground">
          Todavía ningún conductor tiene viajes suficientes en los últimos 30 días para definir su estilo.
        </p>
      ) : (
        <ul className="mt-4 flex flex-col gap-4">
          {ESTILOS_POR_RIESGO.map((estilo) => {
            const { nombre, relleno, icono: Icono } = ESTILO_CONDUCCION[estilo]
            const cantidad = conteo[estilo]
            return (
              <li key={estilo} className="grid grid-cols-[9.5rem_1fr_2rem] items-center gap-3">
                <span className="flex items-center gap-2 text-cuerpo font-medium">
                  <Icono className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {nombre}
                </span>
                <span
                  className="h-3 overflow-hidden rounded-full bg-carril"
                  role="img"
                  aria-label={`${nombre}: ${cantidad} ${cantidad === 1 ? "conductor" : "conductores"}`}
                >
                  <span
                    className={cn("block h-full rounded-full", relleno)}
                    style={{ width: cantidad > 0 ? `${Math.max((cantidad / mayor) * 100, 4)}%` : "0%" }}
                  />
                </span>
                <span className="text-right font-numeros text-numero-metrica tabular-nums">{cantidad}</span>
              </li>
            )
          })}
        </ul>
      )}
      {sinDatos > 0 && (
        <p className="mt-4 text-ayuda text-muted-foreground">
          {sinDatos} {sinDatos === 1 ? "conductor" : "conductores"} todavía sin viajes suficientes en los últimos 30
          días para definir su estilo.
        </p>
      )}
    </section>
  )
}
