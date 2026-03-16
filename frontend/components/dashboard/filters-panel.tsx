"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ScannerTimeframe } from "@/lib/types/scanner";

function updateParam(searchParams: URLSearchParams, key: string, value: string) {
  const next = new URLSearchParams(searchParams);
  next.set(key, value);
  return next.toString();
}

export function FiltersPanel({
  timeframe,
  limit,
  volumePercentile,
  symbolSearch,
  onSymbolSearchChange,
}: {
  timeframe: ScannerTimeframe;
  limit: number;
  volumePercentile: number;
  symbolSearch: string;
  onSymbolSearchChange: (value: string) => void;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-zinc-100">Filters</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">Timeframe</label>
          <div className="grid grid-cols-3 gap-2">
            {(["1h", "4h", "24h"] as ScannerTimeframe[]).map((tf) => (
              <button
                key={tf}
                className={`rounded-md px-2 py-1 text-xs ${
                  timeframe === tf ? "bg-emerald-500/20 text-emerald-300" : "bg-zinc-800 text-zinc-300"
                }`}
                onClick={() => router.push(`${pathname}?${updateParam(new URLSearchParams(searchParams), "timeframe", tf)}`)}
                type="button"
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-zinc-400">Limit</label>
          <Select
            value={String(limit)}
            onChange={(event) =>
              router.push(`${pathname}?${updateParam(new URLSearchParams(searchParams), "limit", event.target.value)}`)
            }
          >
            {[20, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-zinc-400">Volume percentile: {volumePercentile.toFixed(2)}</label>
          <input
            className="w-full accent-emerald-500"
            type="range"
            min={0.5}
            max={0.9}
            step={0.05}
            value={volumePercentile}
            onChange={(event) =>
              router.push(
                `${pathname}?${updateParam(new URLSearchParams(searchParams), "volume_percentile", event.target.value)}`,
              )
            }
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-zinc-400">Symbol search</label>
          <Input
            placeholder="BTC, ETH, SOL..."
            value={symbolSearch}
            onChange={(event) => onSymbolSearchChange(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
