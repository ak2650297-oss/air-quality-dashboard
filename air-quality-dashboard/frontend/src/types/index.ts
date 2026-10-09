export interface Station {
  id: string
  name: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  last_updated: string | null
}

export interface Reading {
  id: number
  station_id: string
  timestamp: string
  aqi: number | null
  pm25: number | null
  pm10: number | null
  co: number | null
  no2: number | null
  so2: number | null
  o3: number | null
}

export interface AqiSummary {
  station_id: string
  station_name: string | null
  city: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  timestamp: string | null
  aqi: number | null
  pm25: number | null
  pm10: number | null
  co: number | null
  no2: number | null
  so2: number | null
  o3: number | null
}
