import { KeyRound } from "lucide-react"
import { useNavigate } from "react-router"

import { DistintivoPuntaje } from "@/components/score-badge"
import { Button } from "@/components/ui/button"
import { AvatarUsuario } from "@/components/user-avatar"
import { formatearDia, formatearEntero, formatearHora } from "@/lib/format"

import type { ConductorFlota } from "../types"

const CLASE_CABECERA = "px-3 py-3 text-left text-etiqueta font-medium text-muted-foreground uppercase"

/** Tabla de conductores de la flota (docs/diseno.md, 6.4). Cada fila abre su perfil. */
export function TablaConductores({
  conductores,
  alNuevaContrasenia,
}: {
  conductores: ConductorFlota[]
  alNuevaContrasenia: (conductor: ConductorFlota) => void
}) {
  const navegar = useNavigate()

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-200 border-collapse">
        <thead className="border-y border-border bg-muted">
          <tr>
            <th scope="col" className={CLASE_CABECERA}>Conductor</th>
            <th scope="col" className={`${CLASE_CABECERA} text-center`}>DriveScore</th>
            <th scope="col" className={`${CLASE_CABECERA} text-right`}>Viajes</th>
            <th scope="col" className={CLASE_CABECERA}>Último viaje</th>
            <th scope="col" className={`${CLASE_CABECERA} text-right`}>
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {conductores.map((c) => (
            <tr
              key={c.id}
              onClick={() => navegar(`/panel/conductores/${c.id}`)}
              className="cursor-pointer border-b border-border text-cuerpo hover:bg-muted"
            >
              <td className="px-3 py-3">
                <span className="flex items-center gap-3">
                  <AvatarUsuario id={c.id} nombre={c.nombre} />
                  <span className="min-w-0 max-w-64">
                    <span className="block truncate text-subtitulo" title={c.nombre}>
                      {c.nombre}
                    </span>
                    <span className="block truncate text-cuerpo-pequeno text-muted-foreground" title={c.email}>
                      {c.email}
                    </span>
                  </span>
                </span>
              </td>
              <td className="px-3 py-3 text-center">
                {c.viajes === 0 ? (
                  <span className="text-cuerpo-pequeno text-muted-foreground">Sin viajes todavía</span>
                ) : (
                  <DistintivoPuntaje drivescore={c.drivescore} calificacion={c.calificacion} />
                )}
              </td>
              <td className="px-3 py-3 text-right font-numeros tabular-nums">{formatearEntero(c.viajes)}</td>
              <td className="px-3 py-3 text-muted-foreground">
                {c.ultimo_viaje ? `${formatearDia(c.ultimo_viaje)} ${formatearHora(c.ultimo_viaje)}` : "—"}
              </td>
              <td className="px-3 py-3 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  title="Nueva contraseña temporal"
                  onClick={(e) => {
                    e.stopPropagation()
                    alNuevaContrasenia(c)
                  }}
                >
                  <KeyRound />
                  <span className="sr-only">Nueva contraseña temporal de {c.nombre}</span>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
