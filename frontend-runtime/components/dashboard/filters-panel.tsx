"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { ScannerTimeframe } from "@/lib/types/scanner";

export type DashboardBucketFilter =
  | "all"
  | "breakout_watch"
  | "positioning_build"
  | "squeeze_watch"
  | "overheat_risk";

function updateParam(searchParams: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(searchParams);
  next.set(key, value);
  return next.toString();
}

export function FiltersPanel({
  timeframe,
  symbolSearch,
  onSymbolSearchChange,
  bucketFilter,
  onBucketFilterChange,
}: {
  timeframe: ScannerTimeframe;
  symbolSearch: string;
  onSymbolSearchChange: (value: string) => void;
  bucketFilter: DashboardBucketFilter;
  onBucketFilterChange: (value: DashboardBucketFilter) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <section className="bn-panel p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="bn-kicker">Scanner controls</p>
            <p className="mt-2 text-sm text-[color:var(--bn-text-muted)]">
              Shift timeframe, narrow the active bucket, or search by symbol without leaving the current persisted run
              view.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {(["1h", "4h", "24h"] as ScannerTimeframe[]).map((tf) => (
              <button
                key={tf}
                className={`bn-mono rounded-lg border px-3 py-1.5 text-[11px] transition ${
                  timeframe === tf
                    ? "border-cyan-400/18 bg-cyan-400/12 text-cyan-100"
                    : "border-[color:var(--bn-border)] bg-[rgba(8,13,20,0.82)] text-[color:var(--bn-text-faint)] hover:text-[var(--bn-text)]"
                }`}
                onClick={() =>
                  router.push(`${pathname}?${updateParam(new URLSearchParams(searchParams), "timeframe", tf)}`)
                }
                type="button"
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-2">
            {(
              [
                ["all", "All candidates"],
                ["breakout_watch", "Breakout"],
                ["positioning_build", "Positioning"],
                ["squeeze_watch", "Squeeze"],
                ["overheat_risk", "Overheat"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => onBucketFilterChange(value)}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-medium transition ${
                  bucketFilter === value
                    ? "border-cyan-400/18 bg-cyan-400/12 text-cyan-100"
                    : "border-[color:var(--bn-border-soft)] bg-[rgba(8,13,20,0.78)] text-[color:var(--bn-text-muted)] hover:text-[var(--bn-text)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="w-full xl:max-w-[260px]">
            <Input
              placeholder="Search symbol..."
              value={symbolSearch}
              onChange={(event) => onSymbolSearchChange(event.target.value)}
              className="rounded-xl border-[color:var(--bn-border)] bg-[rgba(8,13,20,0.82)] py-2 text-[13px] text-[var(--bn-text-strong)] placeholder:text-[color:var(--bn-text-faint)] focus:border-cyan-400/20"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
