import type { AqiSummary } from '../../types'
import { getAqiBand } from '../../utils/aqiColors'
import KpiCard from './KpiCard'

interface KpiCardsProps {
  summary: AqiSummary | null
}

export default function KpiCards({ summary }: KpiCardsProps) {
  if (!summary) {
    return (
      <div className="flex items-center justify-center h-24 text-slate-400 text-sm">
        Select a station to view current readings
      </div>
    )
  }

  const aqiBand = getAqiBand(summary.aqi)

  const cards = [
    { label: 'AQI',   value: summary.aqi,  unit: '',       band: getAqiBand(summary.aqi) },
    { label: 'PM2.5', value: summary.pm25,  unit: 'µg/m³', band: getAqiBand(summary.aqi) },
    { label: 'PM10',  value: summary.pm10,  unit: 'µg/m³', band: getAqiBand(summary.aqi) },
    { label: 'CO',    value: summary.co,    unit: 'mg/m³',  band: getAqiBand(null) },
    { label: 'NO₂',   value: summary.no2,   unit: 'µg/m³', band: getAqiBand(null) },
    { label: 'O₃',    value: summary.o3,    unit: 'µg/m³', band: getAqiBand(null) },
  ]

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="text-base font-semibold text-slate-700">
          {summary.station_name ?? summary.station_id}
        </h2>
        <span className="text-sm text-slate-400">
          {[summary.city, summary.country].filter(Boolean).join(', ')}
        </span>
        <span
          className={`ml-auto rounded px-2 py-0.5 text-xs font-bold ${aqiBand.color} ${aqiBand.textColor}`}
        >
          {aqiBand.label}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {cards.map((c) => (
          <KpiCard
            key={c.label}
            label={c.label}
            value={c.value}
            unit={c.unit}
            colorClass={c.band.color}
            textClass={c.band.textColor}
            bandLabel={c.band.label}
          />
        ))}
      </div>
    </div>
  )
}
