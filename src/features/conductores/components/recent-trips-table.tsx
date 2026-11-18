import { useLocation, useNavigate } from "react-router"

import { DistintivoPuntaje } from "@/components/score-badge"
import { formatearDuracion, formatearFechaHora, formatearKm } from "@/lib/format"

import type { ViajeConductor } from "../types"

const CLASE_CABECERA = "px-3 py-3 text-left text-etiqueta font-medium text-muted-foreground uppercase"

/** Viajes recientes de un conductor (docs/diseno.md, 6.4). Cada fila abre el detalle del viaje. */
export function TablaViajesRecientes({
  conductorId,
  viajes,
}: {
  conductorId: number
  viajes: ViajeConductor[]
}) {
  const navegar = useNavigate()
  const { pathname, search } = useLocation()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-120 border-collapse">
        <thead className="border-y border-border bg-muted">
          <tr>
            <th scope="col" className={CLASE_CABECERA}>Fecha</th>
            <th scope="col" className={`${CLASE_CABECERA} text-right`}>Distancia</th>
            <th scope="col" className={`${CLASE_CABECERA} text-right`}>Duración</th>
            <th scope="col" className={`${CLASE_CABECERA} text-center`}>DriveScore</th>
          </tr>
        </thead>
        <tbody>
          {viajes.map((v) => (
            <tr
              key={v.id}
              tabIndex={0}
              onClick={() =>
                navegar(`/panel/conductores/${conductorId}/viajes/${v.id}`, {
                  state: { volver: `${pathname}${search}` },
                })
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.click()
              }}
              className="cursor-pointer border-b border-border text-cuerpo outline-none hover:bg-muted focus-visible:bg-muted"
            >
              <td className="px-3 py-3 text-foreground">{formatearFechaHora(v.fecha_inicio)}</td>
              <td className="px-3 py-3 text-right tabular-nums text-foreground">{formatearKm(v.distancia_m)}</td>
              <td className="px-3 py-3 text-right tabular-nums text-foreground">{formatearDuracion(v.duracion_s)}</td>
              <td className="px-3 py-3 text-center">
                <DistintivoPuntaje drivescore={v.drivescore} calificacion={v.calificacion} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
