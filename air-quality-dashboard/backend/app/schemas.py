from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class StationSchema(BaseModel):
    id: str
    name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    last_updated: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ReadingSchema(BaseModel):
    id: int
    station_id: str
    timestamp: datetime
    aqi: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    o3: Optional[float] = None

    model_config = {"from_attributes": True}


class AqiSummarySchema(BaseModel):
    station_id: str
    station_name: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: Optional[datetime] = None
    aqi: Optional[float] = None
    pm25: Optional[float] = None
    pm10: Optional[float] = None
    co: Optional[float] = None
    no2: Optional[float] = None
    so2: Optional[float] = None
    o3: Optional[float] = None

    model_config = {"from_attributes": True}
