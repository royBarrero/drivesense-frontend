import type { ChangeEvent, ReactNode } from "react"
import { Controller, type Control, type FieldPath, type FieldValues, type RegisterOptions } from "react-hook-form"

import { CampoContrasenia } from "@/components/password-input"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

interface Props<T extends FieldValues> {
  control: Control<T>
  nombre: FieldPath<T>
  etiqueta: string
  tipo?: "text" | "email" | "tel" | "password"
  autoComplete?: string
  /** Texto de ayuda gris; si hay error, lo reemplaza el mensaje. */
  ayuda?: string
  /** Fuerza el borde rojo (p. ej. aviso general de credenciales incorrectas). */
  conError?: boolean
  /** Oculta el mensaje de error aunque exista (la lista de requisitos ya lo indica). */
  ocultarMensaje?: (mensaje: string | undefined) => boolean
  /** Transforma lo que se escribe (p. ej. teléfono: solo dígitos). */
  filtrar?: (valor: string) => string
  alCambiar?: () => void
  reglas?: Pick<RegisterOptions<T>, "deps">
  deshabilitado?: boolean
  /** Contenido debajo del campo (p. ej. requisitos de la contraseña). */
  debajo?: ReactNode
}

/** Campo con la etiqueta encima y el error debajo (docs/diseno.md, 6.2). */
export function CampoFormulario<T extends FieldValues>({
  control,
  nombre,
  etiqueta,
  tipo = "text",
  autoComplete,
  ayuda,
  conError = false,
  ocultarMensaje,
  filtrar,
  alCambiar,
  reglas,
  deshabilitado,
  debajo,
}: Props<T>) {
  const id = `campo-${nombre.replaceAll(".", "-")}`

  return (
    <Controller
      control={control}
      name={nombre}
      rules={reglas}
      render={({ field, fieldState }) => {
        const mensaje = fieldState.error?.message
        const mostrarMensaje = !!mensaje && !ocultarMensaje?.(mensaje)
        const invalido = conError || !!fieldState.error
        const propsCampo = {
          ...field,
          value: (field.value as string | undefined) ?? "",
          id,
          autoComplete,
          disabled: deshabilitado,
          "aria-invalid": invalido,
          "aria-describedby": mostrarMensaje || ayuda ? `${id}-nota` : undefined,
          onChange: (e: ChangeEvent<HTMLInputElement>) => {
            field.onChange(filtrar ? filtrar(e.target.value) : e.target.value)
            alCambiar?.()
          },
        }

        return (
          <Field data-invalid={invalido}>
            <FieldLabel htmlFor={id}>{etiqueta}</FieldLabel>
            {tipo === "password" ? (
              <CampoContrasenia {...propsCampo} />
            ) : (
              <Input
                {...propsCampo}
                type={tipo}
                inputMode={tipo === "tel" ? "numeric" : undefined}
              />
            )}
            {mostrarMensaje ? (
              <FieldError id={`${id}-nota`}>{mensaje}</FieldError>
            ) : (
              ayuda && <FieldDescription id={`${id}-nota`}>{ayuda}</FieldDescription>
            )}
            {debajo}
          </Field>
        )
      }}
    />
  )
}
