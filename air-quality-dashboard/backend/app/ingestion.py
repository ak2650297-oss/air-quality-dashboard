"""
OpenAQ v3 ingestion service.

Fetches station metadata from OpenAQ, then seeds each station with
realistic fake sensor readings (latest + 7-day history) so the
dashboard always has data to display.
"""
import os
import random
from datetime import datetime, timedelta, timezone

import httpx
from dotenv import load_dotenv

from app.database import SessionLocal
from app import crud

load_dotenv()

OPENAQ_BASE = "https://api.openaq.org/v3"
OPENAQ_API_KEY = os.getenv("OPENAQ_API_KEY", "")
HEADERS = {
    "Accept": "application/json",
    "X-API-Key": OPENAQ_API_KEY,
}

# ---------------------------------------------------------------------------
# Fake data profiles — realistic AQI ranges per world region
# ---------------------------------------------------------------------------
_PROFILES = [
    # (pm25_base, pm10_base, co_base, no2_base, so2_base, o3_base)
    (8.0,   15.0,  0.3,  12.0,  3.0,  45.0),   # Good
    (22.0,  38.0,  0.6,  28.0,  8.0,  55.0),   # Moderate
    (45.0,  72.0,  1.1,  48.0, 15.0,  65.0),   # Unhealthy for sensitive
    (80.0, 120.0,  1.8,  75.0, 25.0,  75.0),   # Unhealthy
    (160.0,220.0,  2.5, 100.0, 40.0,  80.0),   # Very Unhealthy
    (260.0,350.0,  3.5, 140.0, 60.0,  90.0),   # Hazardous
]


def _fake_reading(station_id: str, timestamp: datetime) -> dict:
    """Generate a single realistic fake reading for a station."""
    # Use station_id hash to get a consistent profile per station
    profile_idx = hash(station_id) % len(_PROFILES)
    base = _PROFILES[profile_idx]

    def jitter(val: float, pct: float = 0.15) -> float:
        """Add ±pct random variation."""
        return round(val * (1 + random.uniform(-pct, pct)), 2)

    pm25 = jitter(base[0])
    pm10 = jitter(base[1])
    co   = jitter(base[2])
    no2  = jitter(base[3])
    so2  = jitter(base[4])
    o3   = jitter(base[5])
    aqi  = _pm25_to_aqi(pm25)

    return {
        "station_id": station_id,
        "timestamp":  timestamp,
        "aqi":  aqi,
        "pm25": pm25,
        "pm10": pm10,
        "co":   co,
        "no2":  no2,
        "so2":  so2,
        "o3":   o3,
    }


def _seed_history(db, station_id: str) -> int:
    """Insert one reading per hour for the past 7 days for this station."""
    now = datetime.utcnow().replace(minute=0, second=0, microsecond=0)
    count = 0
    for hours_ago in range(7 * 24, -1, -1):          # 168 h → 0 h
        ts = now - timedelta(hours=hours_ago)
        reading = _fake_reading(station_id, ts)
        crud.upsert_reading(db, reading)
        count += 1
    return count


def run_ingestion() -> None:
    print(f"[Ingestion] Starting at {datetime.utcnow().isoformat()}")
    db = SessionLocal()
    station_count = 0
    reading_count = 0

    try:
        with httpx.Client(timeout=30) as client:
            # Step 1 — fetch station metadata from OpenAQ
            resp = client.get(
                f"{OPENAQ_BASE}/locations",
                headers=HEADERS,
                params={"limit": 100, "parameters_id": 2},
            )
            resp.raise_for_status()
            locations = resp.json().get("results", [])
            print(f"[Ingestion] Fetched {len(locations)} station records from OpenAQ")

            for loc in locations:
                loc_id = str(loc.get("id", ""))
                if not loc_id:
                    continue

                coords = loc.get("coordinates") or {}
                station_data = {
                    "id":        loc_id,
                    "name":      loc.get("name"),
                    "city":      loc.get("locality") or loc.get("city"),
                    "country":   (loc.get("country") or {}).get("name")
                                 or (loc.get("country") or {}).get("code"),
                    "latitude":  coords.get("latitude"),
                    "longitude": coords.get("longitude"),
                }
                crud.upsert_station(db, station_data)
                station_count += 1

                # Step 2 — seed fake historical readings (7 days hourly)
                reading_count += _seed_history(db, loc_id)

    except Exception as exc:
        print(f"[Ingestion] ERROR fetching from OpenAQ: {exc}")
        print("[Ingestion] Falling back to fully synthetic stations...")
        reading_count += _seed_synthetic_fallback(db)
        station_count = 20
    finally:
        db.close()

    print(
        f"[Ingestion] Done — {station_count} stations, {reading_count} readings "
        f"at {datetime.utcnow().isoformat()}"
    )


def _seed_synthetic_fallback(db) -> int:
    """If OpenAQ is unreachable, create 20 synthetic world-city stations."""
    SYNTHETIC = [
        ("s-delhi",     "Delhi",              "Delhi",          "India",          28.61,  77.21),
        ("s-beijing",   "Beijing",            "Beijing",        "China",          39.90, 116.40),
        ("s-london",    "London Central",     "London",         "United Kingdom", 51.51,  -0.13),
        ("s-newyork",   "New York Midtown",   "New York",       "United States",  40.75, -73.99),
        ("s-paris",     "Paris Centre",       "Paris",          "France",         48.86,   2.35),
        ("s-tokyo",     "Tokyo Downtown",     "Tokyo",          "Japan",          35.68, 139.69),
        ("s-sydney",    "Sydney CBD",         "Sydney",         "Australia",     -33.87, 151.21),
        ("s-cairo",     "Cairo City",         "Cairo",          "Egypt",          30.04,  31.24),
        ("s-moscow",    "Moscow Centre",      "Moscow",         "Russia",         55.75,  37.62),
        ("s-lagos",     "Lagos Island",       "Lagos",          "Nigeria",         6.45,   3.39),
        ("s-saopaulo",  "São Paulo Centre",   "São Paulo",      "Brazil",        -23.55, -46.63),
        ("s-mumbai",    "Mumbai Colaba",      "Mumbai",         "India",          18.90,  72.82),
        ("s-toronto",   "Toronto Downtown",   "Toronto",        "Canada",         43.65, -79.38),
        ("s-berlin",    "Berlin Mitte",       "Berlin",         "Germany",        52.52,  13.40),
        ("s-dubai",     "Dubai Centre",       "Dubai",          "UAE",            25.20,  55.27),
        ("s-singapore", "Singapore Central",  "Singapore",      "Singapore",       1.35, 103.82),
        ("s-istanbul",  "Istanbul Centre",    "Istanbul",       "Turkey",         41.01,  28.95),
        ("s-mexico",    "Mexico City Centro", "Mexico City",    "Mexico",         19.43, -99.13),
        ("s-jakarta",   "Jakarta Pusat",      "Jakarta",        "Indonesia",      -6.21, 106.85),
        ("s-nairobi",   "Nairobi CBD",        "Nairobi",        "Kenya",          -1.29,  36.82),
    ]
    count = 0
    for sid, name, city, country, lat, lon in SYNTHETIC:
        crud.upsert_station(db, {
            "id": sid, "name": name, "city": city,
            "country": country, "latitude": lat, "longitude": lon,
        })
        count += _seed_history(db, sid)
    return count


# ---------------------------------------------------------------------------
# US EPA PM2.5 → AQI linear breakpoint lookup (rule-based, no ML)
# ---------------------------------------------------------------------------
_PM25_BREAKPOINTS = [
    (0.0,   12.0,   0,   50),
    (12.1,  35.4,  51,  100),
    (35.5,  55.4, 101,  150),
    (55.5, 150.4, 151,  200),
    (150.5, 250.4, 201, 300),
    (250.5, 500.4, 301, 500),
]


def _pm25_to_aqi(pm25: float) -> float:
    for c_lo, c_hi, i_lo, i_hi in _PM25_BREAKPOINTS:
        if c_lo <= pm25 <= c_hi:
            return round((i_hi - i_lo) / (c_hi - c_lo) * (pm25 - c_lo) + i_lo, 1)
    return 500.0
