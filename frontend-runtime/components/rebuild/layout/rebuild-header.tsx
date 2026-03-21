import Link from "next/link";

import { RebuildTimeframe } from "@/lib/rebuild/preview-state";

export function RebuildHeader({
  surfaceLabel,
  timeframe,
  runId,
  guest,
}: {
  surfaceLabel: string;
  timeframe: RebuildTimeframe;
  runId: number;
  guest: boolean;
}) {
  return (
    <header className="rb-header">
      <div className="rb-brand">
        <span className="rb-brand__mark" aria-hidden="true" />
        <div className="rb-brand__copy">
          <p className="rb-brand__title">BNinmyhands</p>
          <p className="rb-brand__meta">
            {surfaceLabel} · {timeframe} · run {runId}
          </p>
        </div>
      </div>
      <Link className="rb-header__action" href={guest ? "/login" : "/account"}>
        {guest ? "Log in" : "Account"}
      </Link>
    </header>
  );
}
