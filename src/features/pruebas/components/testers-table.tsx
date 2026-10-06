import { formatearDecimal, formatearEntero, formatearFechaHora, formatearKm } from "@/lib/format"

import type { TesterPruebas } from "../types"
import { DistintivoPuntaje } from "./badges"
import { AvatarTester } from "./tester-avatar"

const CLASE_CABECERA = "px-4 py-3 text-left text-etiqueta font-medium text-muted-foreground uppercase"

/** Testers con sus totales del periodo. Al elegir uno se ven sus viajes. */
export function TablaTesters({ testers, alElegir }: { testers: TesterPruebas[]; alElegir: (id: number) => void }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-200 border-collapse">
        <thead className="border-y border-border bg-muted">
          <tr>
            <th scope="col" className={CLASE_CABECERA}>Tester</th>
            <th scope="col" className={`${CLASE_CABECERA} text-right`}>Viajes</th>
            <th scope="col" className={`${CLASE_CABECERA} text-right`}>Distancia</th>
            <th scope="col" className={`${CLASE_CABECERA} text-right`}>Eventos</th>
            <th scope="col" className={`${CLASE_CABECERA} text-right`}>Por 10 km</th>
            <th scope="col" className={CLASE_CABECERA}>Último viaje</th>
            <th scope="col" className={`${CLASE_CABECERA} text-center`}>DriveScore</th>
          </tr>
        </thead>
        <tbody>
          {testers.map((t) => (
            <tr
              key={t.id}
              onClick={() => alElegir(t.id)}
              className="cursor-pointer border-b border-border text-cuerpo hover:bg-muted"
            >
              <td className="px-4 py-3">
                <span className="flex items-center gap-3">
                  <AvatarTester id={t.id} nombre={t.nombre} />
                  <span className="min-w-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        alElegir(t.id)
                      }}
                      className="block truncate text-left text-subtitulo hover:underline"
                    >
                      {t.nombre}
                    </button>
                    <span className="block truncate text-cuerpo-pequeno text-muted-foreground">{t.email}</span>
                  </span>
                </span>
              </td>
              <td className="px-4 py-3 text-right font-numeros tabular-nums">{formatearEntero(t.viajes)}</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">{formatearKm(t.distancia_m)}</td>
              <td className="px-4 py-3 text-right font-numeros tabular-nums">{formatearEntero(t.eventos)}</td>
              <td className="px-4 py-3 text-right font-numeros tabular-nums">
                {t.eventos_por_10km === null ? "—" : formatearDecimal(t.eventos_por_10km)}
              </td>
              <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                {t.ultimo_viaje ? formatearFechaHora(t.ultimo_viaje) : "Sin viajes"}
              </td>
              <td className="px-4 py-3 text-center">
                <DistintivoPuntaje drivescore={t.drivescore_promedio} calificacion={t.calificacion} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
