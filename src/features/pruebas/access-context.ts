import { createContext, useContext } from "react"

/** Si la sesión es la cuenta de pruebas: `null` mientras se comprueba. */
export const ContextoAccesoPruebas = createContext<boolean | null>(null)

export function useAccesoPruebas(): boolean | null {
  return useContext(ContextoAccesoPruebas)
}
