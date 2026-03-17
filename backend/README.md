# Binance USDⓈ-M Futures Scanner (Backend)

FastAPI backend for Binance USDⓈ-M Futures scan/ranking with PostgreSQL persistence and research endpoints.

## Requirements

- Python 3.10+
- Docker + Docker Compose

## Local setup

```bash
# from repo root
docker compose up -d

cd backend
cp .env.example .env
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

## Core endpoints

- `GET /health`
- `GET /health/db`
- `GET /api/scan/today?limit=50&volume_percentile=0.7&timeframe=1h`

## Research endpoints

- `POST /api/research/snapshot`
- `GET /api/research/evaluate`
- `GET /api/research/runs?timeframe=1h`
- `GET /api/research/runs/{run_id}`
- `GET /api/assets/{symbol}/latest`
- `GET /api/assets/{symbol}/history`

## Auto snapshot scheduler

Disabled by default.

Set in `.env`:

- `AUTO_SNAPSHOT_ENABLED=true`
- `AUTO_SNAPSHOT_INTERVAL_SECONDS=900`
- `AUTO_SNAPSHOT_TIMEFRAME=1h`
- `AUTO_SNAPSHOT_LIMIT=50`
- `AUTO_SNAPSHOT_VOLUME_PERCENTILE=0.7`
