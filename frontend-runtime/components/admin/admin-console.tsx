"use client";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/components/auth/auth-provider";
import { LoginRequiredCTA } from "@/components/auth/login-required-cta";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AdsApiError,
  createAdminAdCreative,
  fetchAdminAdCreatives,
  fetchAdminAdSlots,
  updateAdminAdCreative,
  updateAdminAdSlot,
} from "@/lib/api/ads";
import { CommunityApiError, fetchAdminReports } from "@/lib/api/community";
import { AdminAdCreative, AdminAdSlot, AdCreativeStatus } from "@/lib/types/ads";
import { FeatureFlagsApiError, fetchAdminFeatureFlags, updateAdminFeatureFlag } from "@/lib/api/feature-flags";
import { AdminFeatureFlag, FeatureFlagKey } from "@/lib/types/feature-flags";
import { CommunityReport } from "@/lib/types/community";

const CREATIVE_STATUSES: AdCreativeStatus[] = ["draft", "active", "paused", "archived"];

function formatTimestamp(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export function AdminConsole() {
  const { user, loading } = useAuth();
  const [slots, setSlots] = useState<AdminAdSlot[]>([]);
  const [creatives, setCreatives] = useState<AdminAdCreative[]>([]);
  const [featureFlags, setFeatureFlags] = useState<AdminFeatureFlag[]>([]);
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [slotDrafts, setSlotDrafts] = useState<Record<number, { label: string; priority: string }>>({});
  const [newCreative, setNewCreative] = useState({
    slot_id: "",
    title: "",
    body_copy: "",
    image_url: "",
    target_url: "",
    cta_label: "",
    status: "draft" as AdCreativeStatus,
  });
  const [loadingState, setLoadingState] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const loadAdminData = useCallback(async () => {
    setLoadingState(true);
    setError(null);
    try {
      const [nextFlags, nextSlots, nextCreatives, nextReports] = await Promise.all([
        fetchAdminFeatureFlags(),
        fetchAdminAdSlots(),
        fetchAdminAdCreatives(),
        fetchAdminReports(),
      ]);
      setFeatureFlags(nextFlags);
      setSlots(nextSlots);
      setCreatives(nextCreatives);
      setReports(nextReports.slice(0, 10));
      setSlotDrafts(
        Object.fromEntries(
          nextSlots.map((slot) => [slot.id, { label: slot.label, priority: String(slot.priority) }]),
        ),
      );
      if (!newCreative.slot_id && nextSlots[0]) {
        setNewCreative((current) => ({ ...current, slot_id: String(nextSlots[0].id) }));
      }
    } catch (err) {
      if (err instanceof AdsApiError || err instanceof CommunityApiError || err instanceof FeatureFlagsApiError) {
        setError(err.message);
      } else {
        setError("Could not load admin tools.");
      }
    } finally {
      setLoadingState(false);
    }
  }, [newCreative.slot_id]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    void loadAdminData();
  }, [loadAdminData, user]);

  if (loading) {
    return <main className="mx-auto max-w-6xl p-4 text-sm text-zinc-400">Loading admin tools...</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl p-4">
        <LoginRequiredCTA
          title="Admin access requires login"
          description="Log in with an admin account to manage sponsored placements."
        />
      </main>
    );
  }

  if (user.role !== "admin") {
    return (
      <main className="mx-auto max-w-4xl p-4">
        <Card>
          <CardHeader>
            <h1 className="text-lg font-semibold text-zinc-100">Admin</h1>
          </CardHeader>
          <CardContent className="text-sm text-zinc-300">
            This account does not have admin access.
          </CardContent>
        </Card>
      </main>
    );
  }

  const handleSlotSave = async (slotId: number, enabled: boolean) => {
    const draft = slotDrafts[slotId];
    setBusyKey(`slot-${slotId}`);
    setError(null);
    setMessage(null);
    try {
      await updateAdminAdSlot(slotId, {
        label: draft?.label,
        enabled,
        priority: Number(draft?.priority ?? 0),
      });
      setMessage("Ad slot updated.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof AdsApiError ? err.message : "Could not update slot.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreateCreative = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusyKey("create-creative");
    setError(null);
    setMessage(null);
    try {
      await createAdminAdCreative({
        slot_id: Number(newCreative.slot_id),
        title: newCreative.title,
        body_copy: newCreative.body_copy || null,
        image_url: newCreative.image_url || null,
        target_url: newCreative.target_url,
        cta_label: newCreative.cta_label || null,
        status: newCreative.status,
      });
      setMessage("Creative created.");
      setNewCreative((current) => ({
        ...current,
        title: "",
        body_copy: "",
        image_url: "",
        target_url: "",
        cta_label: "",
        status: "draft",
      }));
      await loadAdminData();
    } catch (err) {
      setError(err instanceof AdsApiError ? err.message : "Could not create creative.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleCreativeStatus = async (creativeId: number, status: AdCreativeStatus) => {
    setBusyKey(`creative-${creativeId}`);
    setError(null);
    setMessage(null);
    try {
      await updateAdminAdCreative(creativeId, { status });
      setMessage("Creative updated.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof AdsApiError ? err.message : "Could not update creative.");
    } finally {
      setBusyKey(null);
    }
  };

  const handleFlagToggle = async (key: FeatureFlagKey, enabled: boolean) => {
    setBusyKey(`flag-${key}`);
    setError(null);
    setMessage(null);
    try {
      await updateAdminFeatureFlag(key, enabled);
      setMessage("Feature flag updated.");
      await loadAdminData();
    } catch (err) {
      setError(err instanceof FeatureFlagsApiError ? err.message : "Could not update feature flag.");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <main className="mx-auto max-w-6xl space-y-4 p-4">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold text-zinc-100">Admin</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Launch-safe controls for sponsored placements and a quick moderation visibility check.
          </p>
        </CardHeader>
      </Card>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {loadingState ? <p className="text-sm text-zinc-500">Loading admin data...</p> : null}

      <Card>
        <CardHeader>
          <h2 className="text-sm font-semibold text-zinc-100">Feature flags</h2>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {featureFlags.map((flag) => (
            <div key={flag.key} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
              <p className="text-sm font-medium text-zinc-100">{flag.key}</p>
              <p className="mt-1 text-xs text-zinc-500">Updated {formatTimestamp(flag.updated_at)}</p>
              <Button
                type="button"
                className="mt-3"
                onClick={() => void handleFlagToggle(flag.key, !flag.enabled)}
                disabled={busyKey === `flag-${flag.key}`}
              >
                {flag.enabled ? "Disable" : "Enable"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_1fr]">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-100">Ad slots</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {slots.map((slot) => (
              <div key={slot.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="grid gap-3 md:grid-cols-[1fr_120px_160px] md:items-end">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">{slot.placement}</label>
                    <Input
                      value={slotDrafts[slot.id]?.label ?? ""}
                      onChange={(event) =>
                        setSlotDrafts((current) => ({
                          ...current,
                          [slot.id]: { ...current[slot.id], label: event.target.value, priority: current[slot.id]?.priority ?? String(slot.priority) },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">Priority</label>
                    <Input
                      type="number"
                      value={slotDrafts[slot.id]?.priority ?? String(slot.priority)}
                      onChange={(event) =>
                        setSlotDrafts((current) => ({
                          ...current,
                          [slot.id]: { ...current[slot.id], label: current[slot.id]?.label ?? slot.label, priority: event.target.value },
                        }))
                      }
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => void handleSlotSave(slot.id, !slot.enabled)}
                      disabled={busyKey === `slot-${slot.id}`}
                    >
                      {slot.enabled ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-100">Create creative</h2>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleCreateCreative}>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Slot</label>
                <Select
                  value={newCreative.slot_id}
                  onChange={(event) => setNewCreative((current) => ({ ...current, slot_id: event.target.value }))}
                >
                  {slots.map((slot) => (
                    <option key={slot.id} value={slot.id}>
                      {slot.placement}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Title</label>
                <Input
                  value={newCreative.title}
                  onChange={(event) => setNewCreative((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-zinc-500">Body copy</label>
                <Textarea
                  rows={3}
                  value={newCreative.body_copy}
                  onChange={(event) => setNewCreative((current) => ({ ...current, body_copy: event.target.value }))}
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Target URL</label>
                  <Input
                    value={newCreative.target_url}
                    onChange={(event) => setNewCreative((current) => ({ ...current, target_url: event.target.value }))}
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">CTA label</label>
                  <Input
                    value={newCreative.cta_label}
                    onChange={(event) => setNewCreative((current) => ({ ...current, cta_label: event.target.value }))}
                  />
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Image URL</label>
                  <Input
                    value={newCreative.image_url}
                    onChange={(event) => setNewCreative((current) => ({ ...current, image_url: event.target.value }))}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-zinc-500">Status</label>
                  <Select
                    value={newCreative.status}
                    onChange={(event) => setNewCreative((current) => ({ ...current, status: event.target.value as AdCreativeStatus }))}
                  >
                    {CREATIVE_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
              <Button type="submit" disabled={busyKey === "create-creative"}>
                {busyKey === "create-creative" ? "Saving..." : "Create creative"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-100">Creatives</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {creatives.map((creative) => (
              <div key={creative.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-zinc-100">{creative.title}</p>
                    <p className="text-xs text-zinc-500">
                      {creative.slot_placement} · {creative.status} · updated {formatTimestamp(creative.updated_at)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(["active", "paused", "archived"] as AdCreativeStatus[]).map((status) => (
                      <Button
                        key={status}
                        type="button"
                        className={creative.status === status ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200" : ""}
                        onClick={() => void handleCreativeStatus(creative.id, status)}
                        disabled={busyKey === `creative-${creative.id}`}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
                {creative.body_copy ? <p className="mt-2 text-sm text-zinc-300">{creative.body_copy}</p> : null}
                <p className="mt-2 text-xs text-zinc-500 break-all">{creative.target_url}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-zinc-100">Recent reports</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            {reports.length === 0 ? <p className="text-sm text-zinc-500">No recent moderation reports.</p> : null}
            {reports.map((report) => (
              <div key={report.id} className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-3">
                <p className="text-sm font-medium text-zinc-100">{report.post.symbol}</p>
                <p className="text-xs text-zinc-500">
                  {report.reason} · {report.status} · {formatTimestamp(report.created_at)}
                </p>
                <p className="mt-2 text-xs text-zinc-400">Reporter: {report.reporter.nickname}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
