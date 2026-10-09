from datetime import datetime
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models import Station, Reading
from app.schemas import AqiSummarySchema


def upsert_station(db: Session, data: dict) -> Station:
    station = db.get(Station, data["id"])
    if station is None:
        station = Station(**data)
        db.add(station)
    else:
        for key, value in data.items():
            setattr(station, key, value)
        station.last_updated = datetime.utcnow()
    db.commit()
    db.refresh(station)
    return station


def upsert_reading(db: Session, data: dict) -> Optional[Reading]:
    exists = (
        db.query(Reading)
        .filter(
            Reading.station_id == data["station_id"],
            Reading.timestamp == data["timestamp"],
        )
        .first()
    )
    if exists:
        return exists
    reading = Reading(**data)
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return reading


def get_stations(db: Session) -> list[Station]:
    return db.query(Station).order_by(Station.name).all()


def get_readings(
    db: Session,
    station_id: str,
    start_dt: datetime,
    end_dt: datetime,
) -> list[Reading]:
    return (
        db.query(Reading)
        .filter(
            Reading.station_id == station_id,
            Reading.timestamp >= start_dt,
            Reading.timestamp <= end_dt,
        )
        .order_by(Reading.timestamp)
        .all()
    )


def get_latest_readings(db: Session) -> list[AqiSummarySchema]:
    subq = (
        db.query(
            Reading.station_id,
            func.max(Reading.timestamp).label("max_ts"),
        )
        .group_by(Reading.station_id)
        .subquery()
    )

    rows = (
        db.query(Reading, Station)
        .join(Station, Reading.station_id == Station.id)
        .join(
            subq,
            (Reading.station_id == subq.c.station_id)
            & (Reading.timestamp == subq.c.max_ts),
        )
        .all()
    )

    result = []
    for reading, station in rows:
        result.append(
            AqiSummarySchema(
                station_id=station.id,
                station_name=station.name,
                city=station.city,
                country=station.country,
                latitude=station.latitude,
                longitude=station.longitude,
                timestamp=reading.timestamp,
                aqi=reading.aqi,
                pm25=reading.pm25,
                pm10=reading.pm10,
                co=reading.co,
                no2=reading.no2,
                so2=reading.so2,
                o3=reading.o3,
            )
        )
    return result
