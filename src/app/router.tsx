import { createBrowserRouter, Navigate } from "react-router"

import { LandingPagina } from "@/features/auth/pages/landing-page"
import { RegistroEmpresaPagina } from "@/features/auth/pages/register-page"

import { PanelProvisionalPagina } from "./placeholder-panel"
import { RutaProtegida, SoloSinSesion } from "./route-guards"

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <SoloSinSesion>
        <LandingPagina />
      </SoloSinSesion>
    ),
  },
  {
    path: "/registro",
    element: (
      <SoloSinSesion>
        <RegistroEmpresaPagina />
      </SoloSinSesion>
    ),
  },
  {
    path: "/panel",
    element: (
      <RutaProtegida>
        <PanelProvisionalPagina />
      </RutaProtegida>
    ),
  },
  { path: "*", element: <Navigate to="/" replace /> },
])
