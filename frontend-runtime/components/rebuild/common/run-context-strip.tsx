import { RebuildTimeframe } from "@/lib/rebuild/preview-state";

export function RunContextStrip({
  timeframe,
  runId,
  updatedLabel,
  dataAgeLabel,
  runStatus,
  rowCount,
}: {
  timeframe: RebuildTimeframe;
  runId: number;
  updatedLabel: string;
  dataAgeLabel: string;
  runStatus: string;
  rowCount?: number;
}) {
  return (
    <section className="rb-panel">
      <div className="rb-meta">
        <div className="rb-meta__item">
          <span className="rb-meta__label">Timeframe</span>
          <span className="rb-meta__value">{timeframe}</span>
        </div>
        <div className="rb-meta__item">
          <span className="rb-meta__label">Run ID</span>
          <span className="rb-meta__value rb-meta__value--accent">{runId}</span>
        </div>
        <div className="rb-meta__item">
          <span className="rb-meta__label">Updated</span>
          <span className="rb-meta__value">{updatedLabel}</span>
        </div>
        <div className="rb-meta__item">
          <span className="rb-meta__label">Data age</span>
          <span className="rb-meta__value">{dataAgeLabel}</span>
        </div>
        <div className="rb-meta__item">
          <span className="rb-meta__label">Rows</span>
          <span className="rb-meta__value">{typeof rowCount === "number" ? rowCount : "-"}</span>
        </div>
        <div className="rb-meta__item">
          <span className="rb-meta__label">Status</span>
          <span className="rb-meta__value">{runStatus}</span>
        </div>
      </div>
    </section>
  );
}
