import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import type { AqiSummary } from '../../types'
import { fetchAqiSummary } from '../../api/airQuality'
import { getAqiBand } from '../../utils/aqiColors'

interface MapViewProps {
  onStationSelect: (stationId: string) => void
  selectedId: string | null
}

export default function MapView({ onStationSelect, selectedId }: MapViewProps) {
  const [summaries, setSummaries] = useState<AqiSummary[]>([])

  useEffect(() => {
    fetchAqiSummary().then(setSummaries).catch(console.error)
  }, [])

  const valid = summaries.filter(
    (s) => s.latitude != null && s.longitude != null
  )

  return (
    <div className="bg-white rounded-xl shadow overflow-hidden" style={{ height: 420 }}>
      <div className="px-4 py-3 border-b border-slate-100">
        <h2 className="text-base font-semibold text-slate-700">Station Map</h2>
        <p className="text-xs text-slate-400">Click a marker to select a station</p>
      </div>
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '360px', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {valid.map((s) => {
          const band = getAqiBand(s.aqi)
          const isSelected = s.station_id === selectedId
          return (
            <CircleMarker
              key={s.station_id}
              center={[s.latitude!, s.longitude!]}
              radius={isSelected ? 10 : 7}
              pathOptions={{
                fillColor: band.hex,
                color: isSelected ? '#1e293b' : band.hex,
                weight: isSelected ? 2 : 1,
                fillOpacity: 0.85,
              }}
              eventHandlers={{ click: () => onStationSelect(s.station_id) }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{s.station_name ?? s.station_id}</p>
                  <p className="text-gray-500">{[s.city, s.country].filter(Boolean).join(', ')}</p>
                  <p className="mt-1">
                    AQI: <strong>{s.aqi != null ? Math.round(s.aqi) : '—'}</strong>
                    <span
                      className="ml-2 rounded px-1.5 py-0.5 text-xs font-semibold"
                      style={{ background: band.hex, color: '#fff' }}
                    >
                      {band.label}
                    </span>
                  </p>
                  <p>PM2.5: {s.pm25 != null ? `${s.pm25.toFixed(1)} µg/m³` : '—'}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
    </div>
  )
}
