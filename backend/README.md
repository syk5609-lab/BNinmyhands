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

## Validation

```bash
./.venv/bin/python -m pytest -q
PYTHONPATH=. ./.venv/bin/alembic upgrade head --sql
```

## Launch auth env

Set in `.env` when needed:

- `FRONTEND_ORIGINS=http://127.0.0.1:3000,http://localhost:3000`
- `SESSION_COOKIE_NAME=bn_launch_session`
- `SESSION_DURATION_SECONDS=1209600`
- `SECURE_COOKIES=false`
- `AUTH_DEV_TOKEN_PREVIEW_ENABLED=true`

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

## Auth endpoints

- `POST /auth/signup`
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`
- `PATCH /account/profile`
- `POST /auth/verify/request`
- `POST /auth/verify/confirm`
- `POST /auth/password-reset/request`
- `POST /auth/password-reset/confirm`

## Community / ads / flags

- `GET /community/posts`
- `GET /community/latest`
- `POST /community/posts`
- `POST /community/reports`
- `GET /ads/slots`
- `POST /ads/events`
- `GET /runtime/flags`
- `GET /admin/feature-flags`
- `PATCH /admin/feature-flags/{key}`
- `GET /admin/ads/slots`
- `GET /admin/ads/creatives`

Launch feature flags:

- `community_enabled`
- `ads_enabled`
- `write_actions_enabled`

## Auto snapshot scheduler

Disabled by default.

Set in `.env`:

- `AUTO_SNAPSHOT_ENABLED=true`
- `AUTO_SNAPSHOT_INTERVAL_SECONDS=900`
- `AUTO_SNAPSHOT_TIMEFRAME=1h`
- `AUTO_SNAPSHOT_LIMIT=50`
- `AUTO_SNAPSHOT_VOLUME_PERCENTILE=0.7`
