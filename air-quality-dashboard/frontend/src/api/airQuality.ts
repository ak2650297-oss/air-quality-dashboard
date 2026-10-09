import client from './client'
import type { Station, Reading, AqiSummary } from '../types'

export async function fetchStations(): Promise<Station[]> {
  const { data } = await client.get<Station[]>('/stations')
  return data
}

export async function fetchReadings(
  stationId: string,
  start: string,
  end: string
): Promise<Reading[]> {
  const { data } = await client.get<Reading[]>(`/readings/${stationId}`, {
    params: { start, end },
  })
  return data
}

export async function fetchAqiSummary(): Promise<AqiSummary[]> {
  const { data } = await client.get<AqiSummary[]>('/aqi-summary')
  return data
}
