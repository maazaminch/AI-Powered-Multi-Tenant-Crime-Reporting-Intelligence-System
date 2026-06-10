import { useState } from 'react'

export default function useLocationPicker(initial = null) {
  const [location, setLocation] = useState(initial)

  const resetLocation = () => setLocation(null)

  return {
    location,
    setLocation,
    resetLocation,
  }
}