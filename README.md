# Air Quality Dashboard

A fully public, real-time air quality analytics dashboard built with **FastAPI + SQLite** (backend) and **React + TypeScript** (frontend). Data is ingested automatically from the [OpenAQ](https://openaq.org/) public API — no API key required.

---

## Features

- 🟢 **AQI KPI Cards** — live pollutant readings (AQI, PM2.5, PM10, CO, NO₂, O₃) with colour-coded health bands
- 📈 **Historical Trend Chart** — time-series line chart with date-range picker and per-pollutant toggles
- 🗺️ **Interactive Map** — Leaflet map with AQI-coloured station markers; click a marker to select a station
- 🔄 **Auto-ingestion** — backend fetches fresh data from OpenAQ every 10 minutes via APScheduler

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Python | 3.11+ |
| Node.js | 18+ |
| npm | 9+ |

---

## Quickstart

### 1 — Start the backend

Open a PowerShell terminal and run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
cd air-quality-dashboard\backend
.\venv\Scripts\activate
uvicorn app.main:app --reload
```

The backend starts at **http://localhost:8000**.

> **Note:** The SQLite database file `air_quality.db` is created automatically on first start.
> An initial data ingestion from OpenAQ runs in the background — wait ~15 seconds before
> loading the dashboard to ensure data is available.

### 2 — Start the frontend (new terminal)

Open a **second** PowerShell terminal and run:

```powershell
cd air-quality-dashboard\frontend
npm install
npm run dev
```

The frontend starts at **http://localhost:5173**.

---

## Open the dashboard

Navigate to **http://localhost:5173** in your browser.

---

## API Reference

FastAPI auto-generates interactive API docs at **http://localhost:8000/docs**.

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stations` | List all monitoring stations |
| `GET` | `/api/readings/{station_id}` | Time-series readings (`?start=&end=` ISO params, defaults to last 7 days) |
| `GET` | `/api/aqi-summary` | Latest single reading per station |

> **Note:** Copy `backend/.env.example` to `backend/.env` and fill in your `OPENAQ_API_KEY` before starting.

---

## Project Structure

```
air-quality-dashboard/
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI app, CORS, startup/shutdown hooks
│   │   ├── database.py      # SQLAlchemy engine + session factory
│   │   ├── models.py        # Station and Reading ORM models
│   │   ├── schemas.py       # Pydantic response schemas
│   │   ├── crud.py          # DB query helpers
│   │   ├── ingestion.py     # OpenAQ fetch logic + PM2.5→AQI converter
│   │   ├── scheduler.py     # APScheduler background job (10-min interval)
│   │   └── routes.py        # /api/* REST endpoints
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── api/             # Axios client + typed API functions
    │   ├── components/
    │   │   ├── Layout/      # TopNav + Sidebar
    │   │   ├── KpiCards/    # AQI metric cards
    │   │   ├── TrendChart/  # Recharts line chart
    │   │   └── MapView/     # react-leaflet map
    │   ├── pages/
    │   │   └── Dashboard.tsx
    │   ├── types/           # Shared TypeScript interfaces
    │   └── utils/
    │       └── aqiColors.ts # US EPA AQI colour band lookup table
    ├── package.json
    ├── vite.config.ts       # Vite proxy: /api → localhost:8080
    └── tailwind.config.js
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend framework | FastAPI |
| ASGI server | Uvicorn |
| ORM | SQLAlchemy 2.x |
| Database | SQLite (file-based) |
| HTTP client | httpx |
| Scheduler | APScheduler 3.x |
| Frontend framework | React 18 |
| Language | TypeScript 5 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Maps | react-leaflet + Leaflet |
| HTTP client (frontend) | Axios |
