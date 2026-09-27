import { Check, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

import { requisitosContrasenia } from "../validation"

interface Props {
  contrasenia: string
  /** En rojo los pendientes, cuando el usuario ya salió del campo. */
  resaltarPendientes: boolean
}

/** Requisitos de la contraseña que se marcan al cumplirse (igual que en la app). */
export function RequisitosContrasenia({ contrasenia, resaltarPendientes }: Props) {
  const r = requisitosContrasenia(contrasenia)
  const requisitos = [
    { texto: "Al menos 8 caracteres", cumplido: r.largo },
    { texto: "Al menos una letra", cumplido: r.letra },
    { texto: "Al menos un número", cumplido: r.numero },
  ]

  return (
    <ul className="flex flex-col gap-1" aria-label="Requisitos de la contraseña">
      {requisitos.map(({ texto, cumplido }) => (
        <li
          key={texto}
          className={cn(
            "flex items-center gap-1.5 text-ayuda",
            cumplido ? "text-texto-exito" : resaltarPendientes ? "text-destructive" : "text-texto-terciario",
          )}
        >
          {cumplido ? (
            <Check className="size-4" aria-hidden="true" />
          ) : (
            <Circle className="size-4" aria-hidden="true" />
          )}
          <span>
            {texto}
            <span className="sr-only">{cumplido ? " (cumplido)" : " (pendiente)"}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}
