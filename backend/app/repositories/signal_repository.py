from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.models import (
    Asset,
    Exchange,
    FundingSnapshot,
    Instrument,
    MarketSnapshot,
    OISnapshot,
    PositioningSnapshot,
    SignalRun,
    SignalScore,
    SignalSnapshot,
)
from app.schemas import ScanResponse


class SignalRepository:
    def __init__(self, db: Session):
        self.db = db

    def _get_or_create_exchange(self, code: str = "binance_futures", name: str = "Binance USD-M Futures") -> Exchange:
        exchange = self.db.scalar(select(Exchange).where(Exchange.code == code))
        if exchange:
            return exchange
        exchange = Exchange(code=code, name=name)
        self.db.add(exchange)
        self.db.flush()
        return exchange

    def _get_or_create_asset(self, symbol: str) -> Asset:
        asset = self.db.scalar(select(Asset).where(Asset.symbol == symbol))
        if asset:
            return asset
        asset = Asset(symbol=symbol)
        self.db.add(asset)
        self.db.flush()
        return asset

    def _get_or_create_instrument(self, exchange_id: int, symbol: str) -> Instrument:
        instrument = self.db.scalar(
            select(Instrument).where(Instrument.exchange_id == exchange_id, Instrument.symbol == symbol)
        )
        if instrument:
            return instrument

        base_symbol = symbol[:-4] if symbol.endswith("USDT") else symbol
        asset = self._get_or_create_asset(base_symbol)
        instrument = Instrument(
            exchange_id=exchange_id,
            asset_id=asset.id,
            symbol=symbol,
            quote_asset="USDT",
            contract_type="PERPETUAL",
            status="TRADING",
        )
        self.db.add(instrument)
        self.db.flush()
        return instrument

    def create_signal_run(self, timeframe: str, limit: int, volume_percentile: float, started_at: datetime) -> SignalRun:
        run = SignalRun(
            timeframe=timeframe,
            limit=limit,
            volume_percentile=volume_percentile,
            feature_version="v1",
            signal_version="v2_candidate_dashboard",
            input_params={"timeframe": timeframe, "limit": limit, "volume_percentile": volume_percentile},
            started_at=started_at,
            status="running",
        )
        self.db.add(run)
        self.db.flush()
        return run

    def save_scan_results(self, run: SignalRun, scan: ScanResponse) -> None:
        exchange = self._get_or_create_exchange()
        ts = scan.generated_at.astimezone(timezone.utc)

        for row in scan.results:
            instrument = self._get_or_create_instrument(exchange.id, row.symbol)
            self.db.add(
                MarketSnapshot(
                    instrument_id=instrument.id,
                    ts=ts,
                    last_price=row.last_price,
                    price_change_percent_24h=row.price_change_percent_24h,
                    quote_volume_24h=row.quote_volume_24h,
                    raw_payload=row.model_dump(),
                )
            )
            self.db.add(
                OISnapshot(
                    instrument_id=instrument.id,
                    ts=ts,
                    oi_change_percent_recent=row.oi_change_percent_recent,
                    raw_payload={"oi_change_percent_recent": row.oi_change_percent_recent},
                )
            )
            self.db.add(
                FundingSnapshot(
                    instrument_id=instrument.id,
                    ts=ts,
                    funding_rate=None,
                    raw_payload=None,
                )
            )
            self.db.add(
                PositioningSnapshot(
                    instrument_id=instrument.id,
                    ts=ts,
                    taker_net_flow_recent=row.taker_net_flow_recent,
                    long_short_ratio_recent=row.long_short_ratio_recent,
                    raw_payload={
                        "taker_net_flow_recent": row.taker_net_flow_recent,
                        "long_short_ratio_recent": row.long_short_ratio_recent,
                    },
                )
            )

            snapshot = SignalSnapshot(
                signal_run_id=run.id,
                instrument_id=instrument.id,
                ts=ts,
                symbol=row.symbol,
                last_price=row.last_price,
                price_change_percent_24h=row.price_change_percent_24h,
                quote_volume_24h=row.quote_volume_24h,
                heat_score=row.heat_score,
                momentum_score=row.momentum_score,
                setup_score=row.setup_score,
                positioning_score=row.positioning_score,
                early_signal_score=row.early_signal_score,
                risk_penalty=row.risk_penalty,
                composite_score=row.composite_score,
                signal_bucket=row.signal_bucket,
                reason_tags=row.reason_tags,
                previous_rank=row.previous_rank,
                rank_change=row.rank_change,
                previous_composite_score=row.previous_composite_score,
                composite_delta=row.composite_delta,
                setup_delta=row.setup_delta,
                positioning_delta=row.positioning_delta,
                data_quality_score=row.data_quality_score,
                oi_change_percent_recent=row.oi_change_percent_recent,
                taker_net_flow_recent=row.taker_net_flow_recent,
                long_short_ratio_recent=row.long_short_ratio_recent,
                raw_payload=row.model_dump(),
            )
            self.db.add(snapshot)

            for score_type in (
                "heat_score",
                "momentum_score",
                "setup_score",
                "positioning_score",
                "early_signal_score",
                "risk_penalty",
                "composite_score",
            ):
                self.db.add(
                    SignalScore(
                        signal_run_id=run.id,
                        instrument_id=instrument.id,
                        ts=ts,
                        score_type=score_type,
                        score_value=float(getattr(row, score_type)),
                    )
                )

        run.finished_at = datetime.now(timezone.utc)
        run.status = "completed"
        self.db.flush()

    def mark_run_failed(self, run: SignalRun, error_message: str) -> None:
        run.finished_at = datetime.now(timezone.utc)
        run.status = "failed"
        run.error_message = error_message
        self.db.flush()

    def list_runs(self, timeframe: str) -> list[SignalRun]:
        stmt = (
            select(SignalRun)
            .where(SignalRun.timeframe == timeframe, SignalRun.status == "completed")
            .order_by(SignalRun.started_at)
        )
        return list(self.db.scalars(stmt).all())

    def get_run(self, run_id: int) -> SignalRun | None:
        return self.db.scalar(select(SignalRun).where(SignalRun.id == run_id))

    def get_run_snapshots(self, run_id: int) -> list[SignalSnapshot]:
        stmt = select(SignalSnapshot).where(SignalSnapshot.signal_run_id == run_id).order_by(SignalSnapshot.composite_score.desc())
        return list(self.db.scalars(stmt).all())

    def get_asset_latest(self, symbol: str) -> SignalSnapshot | None:
        stmt = (
            select(SignalSnapshot)
            .where(SignalSnapshot.symbol == symbol)
            .order_by(SignalSnapshot.ts.desc())
            .limit(1)
        )
        return self.db.scalar(stmt)

    def get_asset_history(self, symbol: str, limit: int = 200) -> list[SignalSnapshot]:
        stmt = (
            select(SignalSnapshot)
            .where(SignalSnapshot.symbol == symbol)
            .order_by(SignalSnapshot.ts.desc())
            .limit(limit)
        )
        return list(self.db.scalars(stmt).all())
