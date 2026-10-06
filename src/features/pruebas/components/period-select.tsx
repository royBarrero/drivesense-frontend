import { CalendarDays } from "lucide-react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { esPeriodo, PERIODOS, rangoPeriodo, type Periodo } from "../period"

interface Props {
  valor: Periodo
  alCambiar: (periodo: Periodo) => void
  /** Muestra el rango de fechas ("29 sep – 5 oct") en lugar del nombre del periodo. */
  conRango?: boolean
  className?: string
}

export function SelectorPeriodo({ valor, alCambiar, conRango = false, className }: Props) {
  const nombre = PERIODOS.find((p) => p.valor === valor)?.nombre
  return (
    <Select value={valor} onValueChange={(nuevo) => esPeriodo(nuevo) && alCambiar(nuevo)}>
      <SelectTrigger className={className} aria-label="Periodo">
        <CalendarDays aria-hidden="true" />
        <SelectValue>{conRango ? rangoPeriodo(valor) : nombre}</SelectValue>
      </SelectTrigger>
      <SelectContent position="popper" align="end">
        {PERIODOS.map((p) => (
          <SelectItem key={p.valor} value={p.valor}>
            {p.nombre}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
