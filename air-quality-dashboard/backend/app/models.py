from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, Integer, ForeignKey, Index
from app.database import Base


class Station(Base):
    __tablename__ = "stations"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=True)
    city = Column(String, nullable=True)
    country = Column(String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Reading(Base):
    __tablename__ = "readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    station_id = Column(String, ForeignKey("stations.id"), nullable=False)
    timestamp = Column(DateTime, nullable=False)
    aqi = Column(Float, nullable=True)
    pm25 = Column(Float, nullable=True)
    pm10 = Column(Float, nullable=True)
    co = Column(Float, nullable=True)
    no2 = Column(Float, nullable=True)
    so2 = Column(Float, nullable=True)
    o3 = Column(Float, nullable=True)

    __table_args__ = (
        Index("ix_readings_station_timestamp", "station_id", "timestamp"),
    )
