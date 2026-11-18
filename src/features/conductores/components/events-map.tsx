import "leaflet/dist/leaflet.css"

import { latLngBounds, type LatLngTuple } from "leaflet"
import { MapPinOff } from "lucide-react"
import { Circle, CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet"

import { ESTILO_EVENTO } from "@/lib/events"
import { formatearDiaMes, formatearHora } from "@/lib/format"
import { ATRIBUCION, MOSAICOS } from "@/lib/map"
import { cn } from "@/lib/utils"

import type { PuntoEvento, ZonaRepetida } from "../types"

/**
 * Posición de todos los eventos del periodo, con el color de cada tipo, y las zonas donde se
 * repiten eventos del mismo tipo (círculo punteado). Mismos mosaicos y estilo de marcadores que
 * el mapa del viaje (`MapaViaje`); los colores van como clases en los trazos SVG.
 */
export function MapaEventosConductor({
  puntos,
  zonas,
  alElegir,
}: {
  puntos: PuntoEvento[]
  zonas: ZonaRepetida[]
  alElegir: (punto: PuntoEvento) => void
}) {
  if (puntos.length === 0) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 rounded-lg bg-muted text-center">
        <MapPinOff className="size-8 text-texto-terciario" aria-hidden="true" />
        <p className="text-subtitulo">Sin eventos para mostrar</p>
        <p className="text-cuerpo-pequeno text-muted-foreground">No hay eventos con estos filtros.</p>
      </div>
    )
  }
  const posiciones: LatLngTuple[] = puntos.map((p) => [p.lat, p.lon])

  return (
    // isolate: los controles de Leaflet (z-index 1000) no tapan el menú en móvil
    <div className="relative isolate overflow-hidden rounded-lg">
      <MapContainer
        bounds={latLngBounds(posiciones)}
        boundsOptions={{ padding: [32, 32], maxZoom: 16 }}
        scrollWheelZoom={false}
        className="h-96 w-full"
      >
        <TileLayer url={MOSAICOS} attribution={ATRIBUCION} />
        {zonas.map((zona) => {
          const estilo = ESTILO_EVENTO[zona.tipo]
          return (
            <Circle
              key={`${zona.tipo}-${zona.lat}-${zona.lon}`}
              center={[zona.lat, zona.lon]}
              radius={zona.radio_m}
              pathOptions={{
                className: cn(estilo.relleno, estilo.trazo),
                weight: 2,
                dashArray: "6 6",
                fillOpacity: 0.15,
                opacity: 1,
              }}
            >
              <Tooltip permanent direction="top" offset={[0, -8]}>
                <strong>
                  {zona.eventos} {estilo.plural.toLowerCase()} en esta zona
                </strong>
              </Tooltip>
            </Circle>
          )
        })}
        {puntos.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lon]}
            radius={7}
            pathOptions={{
              className: cn(ESTILO_EVENTO[p.tipo].relleno, "stroke-card cursor-pointer"),
              weight: 2,
              fillOpacity: 1,
              opacity: 1,
            }}
            eventHandlers={{ click: () => alElegir(p) }}
          >
            <Tooltip>
              {ESTILO_EVENTO[p.tipo].nombre} · {formatearDiaMes(p.fecha)} {formatearHora(p.fecha)}
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  )
}
