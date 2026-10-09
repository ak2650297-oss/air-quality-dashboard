import type { Station, AqiSummary } from '../../types'
import { getAqiBand } from '../../utils/aqiColors'

interface SidebarProps {
  stations: Station[]
  summaries: AqiSummary[]
  selectedId: string | null
  onSelect: (id: string) => void
  search: string
}

export default function Sidebar({
  stations,
  summaries,
  selectedId,
  onSelect,
  search,
}: SidebarProps) {
  const summaryMap = Object.fromEntries(summaries.map((s) => [s.station_id, s]))

  const filtered = stations.filter((s) => {
    const q = search.toLowerCase()
    return (
      (s.name ?? '').toLowerCase().includes(q) ||
      (s.city ?? '').toLowerCase().includes(q) ||
      (s.country ?? '').toLowerCase().includes(q)
    )
  })

  return (
    <aside className="w-64 shrink-0 bg-slate-800 text-white overflow-y-auto flex flex-col">
      <div className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-slate-400 border-b border-slate-700">
        Stations ({filtered.length})
      </div>
      <ul className="flex-1">
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-sm text-slate-400 text-center">No stations found</li>
        )}
        {filtered.map((station) => {
          const summary = summaryMap[station.id]
          const band = getAqiBand(summary?.aqi ?? null)
          const isSelected = station.id === selectedId

          return (
            <li
              key={station.id}
              onClick={() => onSelect(station.id)}
              className={`cursor-pointer px-4 py-3 border-b border-slate-700 hover:bg-slate-700 transition-colors ${
                isSelected ? 'bg-slate-600' : ''
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{station.name ?? station.id}</p>
                  <p className="text-xs text-slate-400 truncate">
                    {[station.city, station.country].filter(Boolean).join(', ') || '—'}
                  </p>
                </div>
                {summary?.aqi != null && (
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 text-xs font-bold ${band.color} ${band.textColor}`}
                  >
                    {Math.round(summary.aqi)}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
