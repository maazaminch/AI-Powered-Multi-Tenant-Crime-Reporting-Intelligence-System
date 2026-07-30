import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { locationService } from '../../services/locationService'

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

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng)
    }
  })
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
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false)
  const [error, setError] = useState(null)

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

  // REVERSE GEOCODING (get address from coordinates) - Using Backend API
  const reverseGeocode = async (lat, lng) => {
    setIsReverseGeocoding(true)
    setError(null)
    try {
      const data = await locationService.reverseGeocode(lat, lng)
      
      if (data.success && data.data) {
        setQuery(data.data.address || data.data.formattedAddress)
        return data.data.address || data.data.formattedAddress
      } else {
        throw new Error(data.message || 'Failed to get address')
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error)
      setError('Failed to get address. Please try again.')
      // Fallback to coordinates
      const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      setQuery(fallbackAddress)
      return fallbackAddress
    } finally {
      setIsReverseGeocoding(false)
    }
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

  const handleMapClick = async (latlng) => {
    const lat = latlng.lat
    const lng = latlng.lng

    const newPos = [lat, lng]
    setPosition(newPos)
    setResults([])

    // Reverse geocode to get address
    const address = await reverseGeocode(lat, lng)

    onChange?.({
      type: 'Point',
      coordinates: [lng, lat],
      display_name: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    })
  }

  return (
    <div>
      {/* SEARCH BOX */}
      <input
        value={query}
        onChange={(e) => searchAddress(e.target.value)}
        placeholder="Search address or click on map..."
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
        <MapClickHandler onMapClick={handleMapClick} />

        {position && <Marker position={position} />}
      </MapContainer>

      {isReverseGeocoding && (
        <p className="text-sm text-muted-foreground mt-2">Getting address...</p>
      )}
      
      {error && (
        <p className="text-sm text-red-500 mt-2">{error}</p>
      )}
    </div>
  )
}