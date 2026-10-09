# ─── Air Quality Dashboard — Start Script ───────────────────────────────────
# Run from the repo root:
#   .\start.ps1

$root     = Join-Path $PSScriptRoot "air-quality-dashboard"
$backend  = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"
$uvicorn  = Join-Path $backend "venv\Scripts\uvicorn.exe"

# Kill anything already on port 8000
$portPid = (netstat -ano | Select-String ":8000\s.*LISTENING" |
    ForEach-Object { ($_ -split "\s+")[-1] } | Select-Object -First 1)
if ($portPid) {
    Write-Host "[start] Killing process on port 8000 (PID $portPid)..."
    taskkill /PID $portPid /F | Out-Null
}

# Start backend in a new window
Write-Host "[start] Starting backend..."
Start-Process powershell -ArgumentList '-NoExit', '-Command',
    "Set-Location '$backend'; & '$uvicorn' app.main:app --reload"

# Brief pause so backend has a head start
Start-Sleep -Seconds 2

# Start frontend in a new window
Write-Host "[start] Starting frontend..."
Start-Process powershell -ArgumentList '-NoExit', '-Command',
    "Set-Location '$frontend'; npm run dev"

Write-Host "[start] Done. Backend -> http://localhost:8000   Frontend -> http://localhost:5173"
