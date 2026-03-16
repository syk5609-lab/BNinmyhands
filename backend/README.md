# Binance USDⓈ-M Futures Scanner (Backend)

Minimal FastAPI backend that scans Binance USDⓈ-M Futures markets and returns a ranked list of hot symbols.

## Requirements

- Python 3.10+

## Run locally

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health`
- `GET /api/scan/today?limit=50&volume_percentile=0.7`

## Notes

- Uses Binance public USDⓈ-M Futures endpoints only.
- Scanner filters to `*USDT` symbols, applies volume percentile filter, and computes:
  - `heat_score = price_change_percent_24h * log10(quote_volume_24h)`
- Includes a small in-memory cache in `binance_client.py` to reduce API calls.
