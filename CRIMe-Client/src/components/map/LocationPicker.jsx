import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function MapMover({ position }) {
  const map = useMap()

  useEffect(() => {
    if (position) {
      map.setView(position, 15)
    }
  }, [position])

  return null
}

export default function LocationPicker({
  value = null,
  onChange,
  center = [24.8607, 67.0011],
  zoom = 13
}) {
  const [position, setPosition] = useState(value)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  // sync external value
  useEffect(() => {
    if (value) setPosition(value)
  }, [value])

  // ADDRESS SEARCH (Nominatim)
  const searchAddress = async (text) => {
    setQuery(text)

    if (text.length < 3) {
      setResults([])
      return
    }

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${text}`
    )
    const data = await res.json()
    setResults(data)
  }

  const selectLocation = (item) => {
    const lat = parseFloat(item.lat)
    const lng = parseFloat(item.lon)

    const newPos = [lat, lng]
    setPosition(newPos)
    setResults([])
    setQuery(item.display_name)

    // include display_name so parent can save/show the human-readable address
    onChange?.({
      type: 'Point',
      coordinates: [lng, lat], // backend format
      display_name: item.display_name,
    })
  }

  return (
    <div>
      {/* SEARCH BOX */}
      <input
        value={query}
        onChange={(e) => searchAddress(e.target.value)}
        placeholder="Search address..."
        className="w-full p-2 border rounded"
      />

      {/* SUGGESTIONS */}
      {results.length > 0 && (
        <div className="border bg-white max-h-40 overflow-auto">
          {results.map((r, i) => (
            <div
              key={i}
              onClick={() => selectLocation(r)}
              className="p-2 cursor-pointer hover:bg-gray-100"
            >
              {r.display_name}
            </div>
          ))}
        </div>
      )}

      {/* MAP */}
      <MapContainer
        center={position || center}
        zoom={zoom}
        style={{ height: 360, width: '100%', marginTop: 10 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <MapMover position={position} />

        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  )
}