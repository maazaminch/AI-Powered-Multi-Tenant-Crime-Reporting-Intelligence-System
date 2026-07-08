import React from 'react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function LocationView({ location, height = 300 }) {
  // Backend stores as [lng, lat] (GeoJSON), Leaflet needs [lat, lng]
  const position = location?.coordinates 
    ? [location.coordinates[1], location.coordinates[0]] 
    : null

  if (!position) {
    return (
      <div 
        className="flex items-center justify-center bg-muted rounded-lg border"
        style={{ height }}
      >
        <p className="text-sm text-muted-foreground">No location data available</p>
      </div>
    )
  }

  return (
    <MapContainer
      center={position}
      zoom={15}
      style={{ height, width: '100%' }}
      zoomControl={false}
      attributionControl={false}
      scrollWheelZoom={false}
      dragging={false}
      doubleClickZoom={false}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={position} />
    </MapContainer>
  )
}
