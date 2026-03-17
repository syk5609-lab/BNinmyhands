"use client";

import { useEffect, useMemo, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SymbolScanResult } from "@/lib/types/scanner";
import { formatCompactNumber, formatPercent, formatPrice } from "@/lib/utils/format";

function interpretation(item: SymbolScanResult): string {
  if (item.heat_score > 1 && (item.oi_change_percent_recent ?? 0) > 0 && (item.long_short_ratio_recent ?? 1) > 1) {
    return "Momentum + participation are aligned. Watch for continuation setups.";
  }
  if (item.heat_score > 0) {
    return "Positive heat but mixed participation signals. Manage entry risk.";
  }
  return "Weak/negative heat. Better treated as watchlist unless setup improves.";
}

export function SymbolDetailsNotes({ selected }: { selected?: SymbolScanResult }) {
  const noteKey = selected ? `notes:${selected.symbol}` : "notes:none";
  const [draft, setDraft] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  useEffect(() => {
    if (!selected) {
      setDraft("");
      setSavedNotes([]);
      return;
    }
    const raw = localStorage.getItem(noteKey);
    const parsed = raw ? (JSON.parse(raw) as string[]) : [];
    setSavedNotes(parsed);
    setDraft("");
  }, [noteKey, selected]);

  const title = useMemo(() => (selected ? `${selected.symbol} Details` : "How to use this scanner"), [selected]);

  const saveNote = () => {
    if (!selected || !draft.trim()) return;
    const next = [draft.trim(), ...savedNotes].slice(0, 20);
    localStorage.setItem(noteKey, JSON.stringify(next));
    setSavedNotes(next);
    setDraft("");
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-sm font-semibold text-zinc-100">{title}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        {!selected ? (
          <div className="space-y-2 text-sm text-zinc-300">
            <p>1) Tune timeframe + liquidity filters on the left.</p>
            <p>2) Sort and inspect top heat symbols in the center table.</p>
            <p>3) Click a row to review participation signals and save notes.</p>
          </div>
        ) : (
          <>
            <div className="space-y-1 text-sm text-zinc-200">
              <p>
                <span className="text-zinc-400">Last:</span> {formatPrice(selected.last_price)}
              </p>
              <p>
                <span className="text-zinc-400">24h:</span> {formatPercent(selected.price_change_percent_24h)}
              </p>
              <p>
                <span className="text-zinc-400">Volume:</span> {formatCompactNumber(selected.quote_volume_24h)}
              </p>
              <p>
                <span className="text-zinc-400">Heat:</span> {selected.heat_score.toFixed(2)}
              </p>
              <p className="text-zinc-300">{interpretation(selected)}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Personal Notes</h3>
              <Textarea
                rows={4}
                placeholder="Write your trade idea, risk plan, and invalidation..."
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <Button className="w-full" onClick={saveNote} type="button">
                Save Note
              </Button>
              <div className="space-y-2">
                {savedNotes.length === 0 && <p className="text-xs text-zinc-500">No notes yet for this symbol.</p>}
                {savedNotes.map((note, index) => (
                  <div key={`${index}-${note.slice(0, 12)}`} className="rounded-md border border-zinc-800 bg-zinc-900 p-2 text-xs text-zinc-300">
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
