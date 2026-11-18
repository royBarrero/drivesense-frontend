import type { Periodo } from "@/features/conductores/types"
import { consulta, peticion } from "@/lib/api-client"

import type { TableroFlota } from "./types"

export function obtenerTablero(periodo: Periodo) {
  return peticion<TableroFlota>(`/flotas/tablero${consulta({ periodo })}`)
}
