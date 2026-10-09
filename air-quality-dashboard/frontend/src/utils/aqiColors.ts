/**
 * AQI colour band utility — US EPA PM2.5 breakpoints (rule-based lookup, no ML).
 */
export interface AqiBand {
  label: string
  color: string      // Tailwind bg class
  textColor: string  // Tailwind text class
  hex: string        // hex for Leaflet markers
}

export function getAqiBand(aqi: number | null): AqiBand {
  if (aqi === null || aqi === undefined) {
    return { label: 'N/A', color: 'bg-gray-200', textColor: 'text-gray-600', hex: '#9ca3af' }
  }
  if (aqi <= 50)  return { label: 'Good',                    color: 'bg-green-500',  textColor: 'text-white',     hex: '#22c55e' }
  if (aqi <= 100) return { label: 'Moderate',                color: 'bg-yellow-400', textColor: 'text-gray-900',  hex: '#facc15' }
  if (aqi <= 150) return { label: 'Unhealthy for Sensitive', color: 'bg-orange-500', textColor: 'text-white',     hex: '#f97316' }
  if (aqi <= 200) return { label: 'Unhealthy',               color: 'bg-red-500',    textColor: 'text-white',     hex: '#ef4444' }
  if (aqi <= 300) return { label: 'Very Unhealthy',          color: 'bg-purple-600', textColor: 'text-white',     hex: '#9333ea' }
  return           { label: 'Hazardous',                     color: 'bg-rose-900',   textColor: 'text-white',     hex: '#881337' }
}
