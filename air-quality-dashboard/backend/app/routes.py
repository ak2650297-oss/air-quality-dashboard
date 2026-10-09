from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import crud
from app.schemas import StationSchema, ReadingSchema, AqiSummarySchema

router = APIRouter()


@router.get("/stations", response_model=List[StationSchema])
def list_stations(db: Session = Depends(get_db)):
    """Return all monitoring stations."""
    return crud.get_stations(db)


@router.get("/readings/{station_id}", response_model=List[ReadingSchema])
def get_readings(
    station_id: str,
    start: Optional[str] = Query(None, description="ISO datetime e.g. 2024-01-01T00:00:00"),
    end: Optional[str] = Query(None, description="ISO datetime e.g. 2024-01-07T23:59:59"),
    db: Session = Depends(get_db),
):
    """Return time-series readings for a station within a date range."""
    end_dt = datetime.utcnow() if end is None else datetime.fromisoformat(end)
    start_dt = (end_dt - timedelta(days=7)) if start is None else datetime.fromisoformat(start)
    return crud.get_readings(db, station_id, start_dt, end_dt)


@router.get("/aqi-summary", response_model=List[AqiSummarySchema])
def aqi_summary(db: Session = Depends(get_db)):
    """Return the latest reading for every station (used by KPI cards and map)."""
    return crud.get_latest_readings(db)
