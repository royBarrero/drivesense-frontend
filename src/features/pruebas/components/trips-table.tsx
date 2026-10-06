import { Link, useNavigate } from "react-router"

import { formatearDuracion, formatearFechaHora, formatearKm, formatearVelocidad } from "@/lib/format"

import { ESTILO_EVENTO, TIPOS_EVENTO } from "../constants"
import { textoDispositivo } from "../format"
import type { RecorridoPruebas } from "../types"
import { ConteoEvento, DistintivoPuntaje } from "./badges"
import { AvatarTester } from "./tester-avatar"

const CLASE_CABECERA = "px-3 py-3 text-left text-etiqueta font-medium text-muted-foreground uppercase"

/** Tabla de viajes de pruebas (docs/diseno.md, 6.4). Cada fila abre el detalle. */
export function TablaViajes({ recorridos, volver }: { recorridos: RecorridoPruebas[]; volver: string }) {
  const navegar = useNavigate()
  const abrir = (id: number) => navegar(`/panel/pruebas/viajes/${id}`, { state: { volver } })

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-200 border-collapse">
        <thead className="border-y border-border bg-muted">
          <tr>
            <th scope="col" className={CLASE_CABECERA}>Tester</th>
            <th scope="col" className={CLASE_CABECERA}>Fecha</th>
            <th scope="col" className={CLASE_CABECERA}>Duración</th>
            <th scope="col" className={CLASE_CABECERA}>Distancia</th>
            <th scope="col" className={CLASE_CABECERA}>Vel. máx.</th>
            {TIPOS_EVENTO.map((tipo) => (
              <th key={tipo} scope="col" className={`${CLASE_CABECERA} px-2 text-center`}>
                {ESTILO_EVENTO[tipo].columna}
              </th>
            ))}
            <th scope="col" className={`${CLASE_CABECERA} px-2 text-center`}>DriveScore</th>
          </tr>
        </thead>
        <tbody>
          {recorridos.map((v) => (
            <tr
              key={v.id}
              onClick={() => abrir(v.id)}
              className="cursor-pointer border-b border-border text-cuerpo hover:bg-muted"
            >
              <td className="px-3 py-3">
                <span className="flex items-center gap-3">
                  <AvatarTester id={v.conductor.id} nombre={v.conductor.nombre} />
                  <span className="min-w-0 max-w-36">
                    <Link
                      to={`/panel/pruebas/viajes/${v.id}`}
                      state={{ volver }}
                      title={v.conductor.nombre}
                      onClick={(e) => e.stopPropagation()}
                      className="block truncate text-subtitulo hover:underline"
                    >
                      {v.conductor.nombre}
                    </Link>
                    <span
                      className="block truncate text-cuerpo-pequeno text-muted-foreground"
                      title={textoDispositivo(v, v.conductor.email)}
                    >
                      {textoDispositivo(v, v.conductor.email)}
                    </span>
                  </span>
                </span>
              </td>
              <td className="px-3 py-3 text-muted-foreground">{formatearFechaHora(v.fecha_inicio)}</td>
              <td className="px-3 py-3">{formatearDuracion(v.duracion_s)}</td>
              <td className="px-3 py-3">{formatearKm(v.distancia_m)}</td>
              <td className="px-3 py-3 font-semibold">{formatearVelocidad(v.velocidad_maxima_kmh)}</td>
              {TIPOS_EVENTO.map((tipo) => (
                <td key={tipo} className="px-2 py-3 text-center">
                  <ConteoEvento tipo={tipo} cantidad={v.eventos_por_tipo?.[tipo] ?? null} />
                </td>
              ))}
              <td className="px-2 py-3 text-center">
                <DistintivoPuntaje drivescore={v.drivescore} calificacion={v.calificacion} estado={v.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
