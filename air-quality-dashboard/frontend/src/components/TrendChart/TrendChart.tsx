import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { fetchReadings } from '../../api/airQuality'
import type { Reading } from '../../types'

interface TrendChartProps {
  stationId: string | null
}

function toDateInput(date: Date): string {
  return date.toISOString().slice(0, 10)
}

const POLLUTANTS = [
  { key: 'pm25', label: 'PM2.5', color: '#3b82f6' },
  { key: 'pm10', label: 'PM10',  color: '#f97316' },
  { key: 'co',   label: 'CO',    color: '#10b981' },
] as const

type PollutantKey = (typeof POLLUTANTS)[number]['key']

export default function TrendChart({ stationId }: TrendChartProps) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [startDate, setStartDate] = useState(toDateInput(weekAgo))
  const [endDate, setEndDate] = useState(toDateInput(now))
  const [readings, setReadings] = useState<Reading[]>([])
  const [loading, setLoading] = useState(false)
  const [visible, setVisible] = useState<Record<PollutantKey, boolean>>({
    pm25: true,
    pm10: true,
    co: true,
  })

  useEffect(() => {
    if (!stationId) return
    setLoading(true)
    fetchReadings(stationId, `${startDate}T00:00:00`, `${endDate}T23:59:59`)
      .then(setReadings)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [stationId, startDate, endDate])

  const chartData = readings.map((r) => ({
    time: new Date(r.timestamp).toLocaleDateString(),
    pm25: r.pm25,
    pm10: r.pm10,
    co: r.co,
  }))

  const togglePollutant = (key: PollutantKey) => {
    setVisible((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="bg-white rounded-xl shadow p-4">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <h2 className="text-base font-semibold text-slate-700 mr-auto">Historical Trends</h2>
        <div className="flex items-center gap-2 text-sm">
          <label className="text-slate-500">From</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <label className="text-slate-500">To</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border border-slate-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-3 text-sm">
          {POLLUTANTS.map((p) => (
            <label key={p.key} className="flex items-center gap-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={visible[p.key]}
                onChange={() => togglePollutant(p.key)}
                className="accent-blue-500"
              />
              <span style={{ color: p.color }} className="font-medium">{p.label}</span>
            </label>
          ))}
        </div>
      </div>

      {!stationId && (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          Select a station to view trends
        </div>
      )}

      {stationId && loading && (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      )}

      {stationId && !loading && chartData.length === 0 && (
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          No readings available for this date range
        </div>
      )}

      {stationId && !loading && chartData.length > 0 && (
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="time" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            {POLLUTANTS.filter((p) => visible[p.key]).map((p) => (
              <Line
                key={p.key}
                type="monotone"
                dataKey={p.key}
                name={p.label}
                stroke={p.color}
                dot={false}
                strokeWidth={2}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
