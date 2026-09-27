import { RouterProvider } from "react-router"

import { SesionProvider } from "@/features/auth/session-provider"

import { router } from "./router"

export function App() {
  return (
    <SesionProvider>
      <RouterProvider router={router} />
    </SesionProvider>
  )
}
