import threading
import time
from datetime import datetime, timezone

from app.config import settings
from app.services.research import save_snapshot

_stop_event = threading.Event()
_thread: threading.Thread | None = None


def _runner() -> None:
    while not _stop_event.is_set():
        try:
            save_snapshot(
                timeframe=settings.auto_snapshot_timeframe,
                limit=settings.auto_snapshot_limit,
                volume_percentile=settings.auto_snapshot_volume_percentile,
            )
        except Exception:
            pass
        _stop_event.wait(settings.auto_snapshot_interval_seconds)


def start_scheduler() -> None:
    global _thread
    if not settings.auto_snapshot_enabled:
        return
    if _thread and _thread.is_alive():
        return
    _stop_event.clear()
    _thread = threading.Thread(target=_runner, name="auto-snapshot-scheduler", daemon=True)
    _thread.start()


def stop_scheduler() -> None:
    _stop_event.set()
    if _thread and _thread.is_alive():
        _thread.join(timeout=1.0)
