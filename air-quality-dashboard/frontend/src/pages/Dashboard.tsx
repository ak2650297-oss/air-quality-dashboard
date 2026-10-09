import { useState, useEffect } from 'react'
import TopNav from '../components/Layout/TopNav'
import Sidebar from '../components/Layout/Sidebar'
import KpiCards from '../components/KpiCards/KpiCards'
import TrendChart from '../components/TrendChart/TrendChart'
import MapView from '../components/MapView/MapView'
import { fetchStations, fetchAqiSummary } from '../api/airQuality'
import type { Station, AqiSummary } from '../types'

export default function Dashboard() {
  const [stations, setStations] = useState<Station[]>([])
  const [summaries, setSummaries] = useState<AqiSummary[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchStations().then(setStations).catch(console.error)
    fetchAqiSummary().then(setSummaries).catch(console.error)
  }, [])

  // Auto-select first station when data loads
  useEffect(() => {
    if (stations.length > 0 && selectedId === null) {
      setSelectedId(stations[0].id)
    }
  }, [stations])

  const selectedSummary = summaries.find((s) => s.station_id === selectedId) ?? null

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden">
      <TopNav search={search} onSearchChange={setSearch} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          stations={stations}
          summaries={summaries}
          selectedId={selectedId}
          onSelect={setSelectedId}
          search={search}
        />
        <main className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          <section className="bg-white rounded-xl shadow p-4">
            <KpiCards summary={selectedSummary} />
          </section>
          <TrendChart stationId={selectedId} />
          <MapView onStationSelect={setSelectedId} selectedId={selectedId} />
        </main>
      </div>
    </div>
  )
}
