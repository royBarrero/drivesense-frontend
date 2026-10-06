import "leaflet/dist/leaflet.css"

import { latLngBounds, type LatLngTuple } from "leaflet"
import { MapPinOff } from "lucide-react"
import { CircleMarker, MapContainer, Polyline, TileLayer, Tooltip } from "react-leaflet"

import { formatearHora } from "@/lib/format"
import { cn } from "@/lib/utils"

import { ESTILO_EVENTO } from "../constants"
import type { EventoPruebas, PuntoRuta } from "../types"

// Mismo proveedor que la app (trip_map.dart); su política exige la atribución visible
const MOSAICOS = "https://tile.openstreetmap.org/{z}/{x}/{y}.png"
const ATRIBUCION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'

/**
 * Ruta y eventos del viaje (docs/diseno.md, 8.7). Los colores van como clases en los
 * trazos SVG: el CSS pisa los atributos que pone Leaflet.
 */
export function MapaViaje({ ruta, eventos }: { ruta: PuntoRuta[]; eventos: EventoPruebas[] }) {
  const puntos: LatLngTuple[] = ruta.map((p) => [p.lat, p.lon])
  const todos: LatLngTuple[] = [...puntos, ...eventos.map((e): LatLngTuple => [e.lat, e.lon])]

  if (todos.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-lg bg-muted text-center">
        <MapPinOff className="size-8 text-texto-terciario" aria-hidden="true" />
        <p className="text-subtitulo">Sin ruta registrada</p>
        <p className="text-cuerpo-pequeno text-muted-foreground">La app no envió puntos GPS de este viaje.</p>
      </div>
    )
  }

  const inicio = puntos[0]
  const fin = puntos.at(-1)

  return (
    // isolate: los controles de Leaflet (z-index 1000) no tapan el menú en móvil
    <div className="relative isolate overflow-hidden rounded-lg">
      <MapContainer
        bounds={latLngBounds(todos)}
        boundsOptions={{ padding: [24, 24], maxZoom: 17 }}
        scrollWheelZoom={false}
        className="h-96 w-full"
      >
        <TileLayer url={MOSAICOS} attribution={ATRIBUCION} />
        {puntos.length > 1 && (
          <Polyline positions={puntos} pathOptions={{ className: "stroke-primario", weight: 5, opacity: 1 }} />
        )}
        {inicio && (
          <CircleMarker
            center={inicio}
            radius={7}
            pathOptions={{ className: "fill-card stroke-primario", weight: 4, fillOpacity: 1, opacity: 1 }}
          >
            <Tooltip>Inicio</Tooltip>
          </CircleMarker>
        )}
        {fin && puntos.length > 1 && (
          <CircleMarker
            center={fin}
            radius={8}
            pathOptions={{ className: "fill-encabezado-fondo stroke-card", weight: 2, fillOpacity: 1, opacity: 1 }}
          >
            <Tooltip>Fin</Tooltip>
          </CircleMarker>
        )}
        {eventos.map((e) => (
          <CircleMarker
            key={e.id}
            center={[e.lat, e.lon]}
            radius={7}
            pathOptions={{
              className: cn(ESTILO_EVENTO[e.tipo].relleno, "stroke-card"),
              weight: 2,
              fillOpacity: 1,
              opacity: 1,
            }}
          >
            <Tooltip>
              {ESTILO_EVENTO[e.tipo].nombre} · {formatearHora(e.fecha)}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
