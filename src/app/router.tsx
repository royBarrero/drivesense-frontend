import { createBrowserRouter, Navigate } from "react-router"

import { LandingPagina } from "@/features/auth/pages/landing-page"
import { RegistroEmpresaPagina } from "@/features/auth/pages/register-page"
import { ConductoresPagina } from "@/features/conductores/pages/drivers-page"
import { PlanPagina } from "@/features/suscripciones/pages/plan-page"
import { PlanProvider } from "@/features/suscripciones/plan-provider"
import { ReportesPagina } from "@/features/reportes/pages/reports-page"
import { PerfilConductorPagina } from "@/features/conductores/pages/driver-profile-page"
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
          <PlanProvider>
            <PanelLayout />
          </PlanProvider>
        </AccesoPruebasProvider>
      </RutaProtegida>
    ),
    children: [
      { index: true, element: <InicioPagina /> },
      { path: "conductores", element: <ConductoresPagina /> },
      { path: "reportes", element: <ReportesPagina /> },
      { path: "plan", element: <PlanPagina /> },
      { path: "conductores/:id", element: <PerfilConductorPagina /> },
      {
        path: "conductores/:id/viajes/:viajeId",
        // Trae Leaflet (el mapa): se carga solo al abrir un viaje
        lazy: async () => {
          const { DetalleViajeConductorPagina } = await import("@/features/conductores/pages/driver-trip-page")
          return { element: <DetalleViajeConductorPagina /> }
        },
      },
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
        path: "pruebas/demo",
        // El simulador trae Leaflet (el mapa): se carga solo al abrirlo
        lazy: async () => {
          const { DemoPruebasPagina } = await import("@/features/pruebas/pages/demo-page")
          return {
            element: (
              <RutaPruebas>
                <DemoPruebasPagina />
              </RutaPruebas>
            ),
          }
        },
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
