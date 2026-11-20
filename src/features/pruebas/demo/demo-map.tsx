import "leaflet/dist/leaflet.css"

import { divIcon, latLngBounds, type LatLngTuple } from "leaflet"
import { useEffect, useMemo } from "react"
import { CircleMarker, MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from "react-leaflet"

import { ESTILO_EVENTO } from "@/lib/events"
import { ATRIBUCION, MOSAICOS } from "@/lib/map"
import { cn } from "@/lib/utils"

import type { EventoDetectado } from "./detector"

/** Zoom con el que la cámara sigue al auto. */
const ZOOM_SIGUIENDO = 17

/** Auto visto desde arriba (la trompa hacia arriba), girado según el rumbo. */
const SVG_AUTO = [
  `<svg viewBox="0 0 24 44" class="h-11 w-6" aria-hidden="true">`,
  // Ruedas
  `<rect x="0.5" y="8" width="4" height="8" rx="1.5" class="fill-encabezado-superficie"/>`,
  `<rect x="19.5" y="8" width="4" height="8" rx="1.5" class="fill-encabezado-superficie"/>`,
  `<rect x="0.5" y="29" width="4" height="8" rx="1.5" class="fill-encabezado-superficie"/>`,
  `<rect x="19.5" y="29" width="4" height="8" rx="1.5" class="fill-encabezado-superficie"/>`,
  // Carrocería
  `<rect x="2.5" y="1.5" width="19" height="41" rx="7" class="fill-encabezado-acento stroke-encabezado-fondo" stroke-width="1.5"/>`,
  // Parabrisas, techo y luneta
  `<path d="M5.5 14 Q12 10.5 18.5 14 L17 19 Q12 17.5 7 19 Z" class="fill-encabezado-fondo"/>`,
  `<rect x="7" y="20.5" width="10" height="10" rx="2" class="fill-encabezado-fondo" opacity="0.25"/>`,
  `<path d="M7 32.5 Q12 34 17 32.5 L18 37 Q12 39 6 37 Z" class="fill-encabezado-fondo"/>`,
  // Faros
  `<rect x="5" y="2.5" width="4" height="2" rx="1" class="fill-card"/>`,
  `<rect x="15" y="2.5" width="4" height="2" rx="1" class="fill-card"/>`,
  `</svg>`,
].join("")

function iconoAuto(rumbo: number) {
  return divIcon({
    className: "",
    iconSize: [44, 44],
    iconAnchor: [22, 22],
    html: `<div class="flex size-11 items-center justify-center" style="transform: rotate(${Math.round(rumbo)}deg)">${SVG_AUTO}</div>`,
  })
}

/** Encuadra la ruta antes del viaje y sigue al auto durante el viaje. */
function Camara({ puntos, auto }: { puntos: LatLngTuple[]; auto: LatLngTuple | null }) {
  const mapa = useMap()
  useEffect(() => {
    if (!auto) mapa.fitBounds(latLngBounds(puntos), { padding: [24, 24] })
  }, [mapa, puntos, auto])
  useEffect(() => {
    if (auto) mapa.setView(auto, Math.max(mapa.getZoom(), ZOOM_SIGUIENDO), { animate: false })
  }, [mapa, auto])
  return null
}

/** Ruta de la demo, tramo recorrido, auto y eventos detectados (docs/diseno.md, 8.7). */
export function MapaDemo({
  puntos,
  recorrido,
  auto,
  rumbo,
  eventos,
}: {
  puntos: LatLngTuple[]
  recorrido: LatLngTuple[]
  /** Posición del auto; nula antes de iniciar. */
  auto: LatLngTuple | null
  rumbo: number
  eventos: EventoDetectado[]
}) {
  const icono = useMemo(() => iconoAuto(rumbo), [rumbo])
  const inicio = puntos[0]
  const fin = puntos.at(-1)

  return (
    // isolate: los controles de Leaflet (z-index 1000) no tapan el menú en móvil
    <div className="relative isolate overflow-hidden rounded-lg">
      <MapContainer bounds={latLngBounds(puntos)} scrollWheelZoom={false} className="h-96 w-full">
        <TileLayer url={MOSAICOS} attribution={ATRIBUCION} />
        <Camara puntos={puntos} auto={auto} />
        <Polyline positions={puntos} pathOptions={{ className: "stroke-texto-terciario", weight: 5, opacity: 0.6 }} />
        {recorrido.length > 1 && (
          <Polyline positions={recorrido} pathOptions={{ className: "stroke-primario", weight: 6, opacity: 1 }} />
        )}
        {inicio && (
          <CircleMarker
            center={inicio}
            radius={7}
            pathOptions={{ className: "fill-card stroke-primario", weight: 4, fillOpacity: 1, opacity: 1 }}
          >
            <Tooltip>Salida</Tooltip>
          </CircleMarker>
        )}
        {fin && (
          <CircleMarker
            center={fin}
            radius={8}
            pathOptions={{ className: "fill-encabezado-fondo stroke-card", weight: 2, fillOpacity: 1, opacity: 1 }}
          >
            <Tooltip>Destino</Tooltip>
          </CircleMarker>
        )}
        {eventos.map((e) => (
          <CircleMarker
            key={`${e.tipo}-${e.t}`}
            center={[e.lat, e.lon]}
            radius={7}
            pathOptions={{
              className: cn(ESTILO_EVENTO[e.tipo].relleno, "stroke-card"),
              weight: 2,
              fillOpacity: 1,
              opacity: 1,
            }}
          >
            <Tooltip>{ESTILO_EVENTO[e.tipo].nombre}</Tooltip>
          </CircleMarker>
        ))}
        {auto && <Marker position={auto} icon={icono} keyboard={false} interactive={false} />}
      </MapContainer>
    </div>
  )
}
