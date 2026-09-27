import { ShieldCheck, Truck, type LucideIcon } from "lucide-react"
import { Controller, type Control } from "react-hook-form"

import { Field, FieldContent, FieldDescription, FieldError, FieldLabel, FieldTitle } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import type { TipoEmpresa } from "../types"
import type { DatosFormularioRegistro } from "../validation"

const OPCIONES: { valor: TipoEmpresa; titulo: string; descripcion: string; Icono: LucideIcon }[] = [
  { valor: "flota", titulo: "Flota", descripcion: "Empresas de transporte o reparto.", Icono: Truck },
  { valor: "aseguradora", titulo: "Aseguradora", descripcion: "Compañías de seguros.", Icono: ShieldCheck },
]

/** Tipo de empresa como dos opciones en tarjetas. */
export function SelectorTipoEmpresa({ control }: { control: Control<DatosFormularioRegistro> }) {
  return (
    <Controller
      control={control}
      name="empresa.tipo"
      render={({ field, fieldState }) => (
        <Field data-invalid={!!fieldState.error}>
          <FieldLabel id="tipo-empresa-etiqueta">Tipo</FieldLabel>
          <RadioGroup
            value={field.value ?? ""}
            onValueChange={field.onChange}
            onBlur={field.onBlur}
            aria-labelledby="tipo-empresa-etiqueta"
            aria-invalid={!!fieldState.error}
            className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1"
          >
            {OPCIONES.map(({ valor, titulo, descripcion, Icono }) => (
              <FieldLabel
                key={valor}
                htmlFor={`tipo-${valor}`}
                className="rounded-lg aria-invalid:border-peligro has-data-checked:border-ring has-data-checked:bg-tinte-primario"
              >
                <Field orientation="horizontal" className="min-h-11">
                  <Icono className="mt-0.5 size-5 shrink-0 text-primario-oscuro" aria-hidden="true" />
                  <FieldContent>
                    <FieldTitle className="text-subtitulo">{titulo}</FieldTitle>
                    <FieldDescription>{descripcion}</FieldDescription>
                  </FieldContent>
                  <RadioGroupItem value={valor} id={`tipo-${valor}`} />
                </Field>
              </FieldLabel>
            ))}
          </RadioGroup>
          {fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
        </Field>
      )}
    />
  )
}
