import threading
from apscheduler.schedulers.background import BackgroundScheduler

from app.ingestion import run_ingestion

_scheduler = BackgroundScheduler()


def start_scheduler() -> None:
    _scheduler.add_job(run_ingestion, "interval", minutes=10, id="ingestion")
    _scheduler.start()
    print("[Scheduler] Started. Running initial ingestion in background...")
    t = threading.Thread(target=run_ingestion, daemon=True)
    t.start()


def stop_scheduler() -> None:
    _scheduler.shutdown(wait=False)
    print("[Scheduler] Stopped.")
