import { createBrowserRouter, Navigate } from "react-router"

import { LandingPagina } from "@/features/auth/pages/landing-page"
import { RegistroEmpresaPagina } from "@/features/auth/pages/register-page"
import { AccesoPruebasProvider, RutaPruebas } from "@/features/pruebas/access-provider"
import { ViajesPruebasPagina } from "@/features/pruebas/pages/trips-page"

import { InicioPagina } from "./home-page"
import { PanelLayout } from "./panel-layout"
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
        {/* Temporal: el modo pruebas se consulta una vez para todo el panel */}
        <AccesoPruebasProvider>
          <PanelLayout />
        </AccesoPruebasProvider>
      </RutaProtegida>
    ),
    children: [
      { index: true, element: <InicioPagina /> },
      // Temporal: modo pruebas (se retira con features/pruebas)
      {
        path: "pruebas",
        element: (
          <RutaPruebas>
            <ViajesPruebasPagina />
          </RutaPruebas>
        ),
      },
      {
        path: "pruebas/viajes/:id",
        // El detalle trae Leaflet (el mapa): se carga solo al abrirlo
        lazy: async () => {
          const { DetalleViajePruebasPagina } = await import("@/features/pruebas/pages/trip-detail-page")
          return {
            element: (
              <RutaPruebas>
                <DetalleViajePruebasPagina />
              </RutaPruebas>
            ),
          }
        },
      },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
])
