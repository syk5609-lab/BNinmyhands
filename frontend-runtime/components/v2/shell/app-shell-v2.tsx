import Link from "next/link";
import { ReactNode } from "react";

import { V2RunContext } from "@/components/v2/types";
import { v2Theme } from "@/components/v2/theme";

export function AppShellV2({
  children,
  footerCopy = "Research / educational use only. Not financial advice. Data may be delayed, incomplete, or stale.",
}: {
  children: ReactNode;
  footerCopy?: string;
}) {
  return (
    <div className={`${v2Theme.page} flex flex-col`}>
      {children}
      <footer className={`${v2Theme.content} mt-auto border-t ${v2Theme.borderSoft} py-5`}>
        <p className="text-center text-[10px] tracking-wide text-[#657084]">{footerCopy}</p>
      </footer>
    </div>
  );
}

export function SiteHeaderV2({
  current,
  guest,
  detailSymbol,
}: {
  current: "dashboard" | "detail";
  guest: boolean;
  detailSymbol?: string;
}) {
  return (
    <header className={`sticky top-0 z-50 border-b ${v2Theme.border} bg-[rgba(8,13,20,0.94)] backdrop-blur-xl`}>
      <div className={`${v2Theme.content} flex h-12 items-center justify-between`}>
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href="/preview/dashboard-v2?state=ready&ads=on&guest=1" className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-cyan-400/25 bg-[linear-gradient(180deg,rgba(82,213,255,0.18),rgba(82,213,255,0.05))] text-[11px] font-semibold text-cyan-300">
              BN
            </span>
            <span className="truncate text-[14px] font-semibold tracking-tight text-[#f4f7fb]">BNinmyhands</span>
          </Link>

          <div className="hidden h-5 w-px bg-[rgba(30,42,58,0.82)] md:block" />

          {current === "dashboard" ? (
            <nav className="hidden items-center gap-1 md:flex">
              <Link
                href="/preview/dashboard-v2?state=ready&ads=on&guest=1"
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/18 bg-[#141c28] px-3 py-1.5 text-[11px] font-medium text-[#eef6ff]"
              >
                Dashboard
                <span className="h-1 w-1 rounded-full bg-cyan-400" />
              </Link>
              <span className="inline-flex items-center rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#657084]">
                Community
              </span>
            </nav>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                href="/preview/dashboard-v2?state=ready&ads=on&guest=1"
                className="rounded-lg px-3 py-1.5 text-[11px] font-medium text-[#8b96a8] hover:bg-[#0f1520] hover:text-[#dce5ef]"
              >
                Scanner
              </Link>
              <div className="h-5 w-px bg-[rgba(30,42,58,0.82)]" />
              <span className="text-[14px] font-semibold text-[#f4f7fb]">{detailSymbol}</span>
              <span className="text-[11px] text-[#657084]">Candidate Detail</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {guest ? (
            <Link
              href="#"
              className="inline-flex items-center rounded-lg border border-cyan-400/18 bg-[rgba(0,161,255,0.08)] px-3 py-1.5 text-[11px] font-medium text-cyan-200"
            >
              Sign in
            </Link>
          ) : (
            <span className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-[#9aa6b7]">
              <span className="flex h-6 w-6 items-center justify-center rounded-md border border-cyan-400/20 bg-cyan-400/10 text-[10px] font-semibold text-cyan-300">
                U
              </span>
              User
            </span>
          )}
        </div>
      </div>
    </header>
  );
}

export function RunContextStripV2({ ctx }: { ctx: V2RunContext }) {
  const ingestionLabel =
    ctx.ingestionHealth === "ok" ? "INGESTION OK" : ctx.ingestionHealth === "delayed" ? "INGESTION DELAYED" : "INGESTION ERROR";
  const ingestionDot =
    ctx.ingestionHealth === "ok" ? "bg-emerald-400" : ctx.ingestionHealth === "delayed" ? "bg-amber-400" : "bg-rose-400";
  const runDot = ctx.runStatus === "complete" ? "bg-emerald-400" : "bg-amber-400";

  return (
    <section className={`sticky top-12 z-40 border-y ${v2Theme.borderSoft} bg-[rgba(6,10,16,0.9)] backdrop-blur-xl`}>
      <div className={`${v2Theme.content} overflow-x-auto`}>
        <div className="flex min-w-max items-center gap-2 py-2 text-[10px] text-[#8b96a8]">
          <MetaPill strong mono>{ctx.timeframe}</MetaPill>
          <MetaPill>Updated {ctx.updatedLabel}</MetaPill>
          <MetaPill>{ctx.dataAgeLabel}</MetaPill>
          <MetaPill mono>{ctx.runId}</MetaPill>
          <MetaPill mono>N={ctx.symbolCount}</MetaPill>
          <StatusPill dotClass={runDot}>RUN {ctx.runStatus.toUpperCase()}</StatusPill>
          <StatusPill dotClass={ingestionDot}>{ingestionLabel}</StatusPill>
        </div>
      </div>
    </section>
  );
}

export function SectionKickerV2({ children }: { children: ReactNode }) {
  return <p className={v2Theme.kicker}>{children}</p>;
}

export function TrustStripV2({ copy }: { copy: string }) {
  return (
    <div className={`${v2Theme.content} flex items-center gap-2 py-1.5 text-[10px] text-[#657084]`}>
      <span className="h-1 w-1 rounded-full bg-[#4b5565]" />
      <span>{copy}</span>
    </div>
  );
}

export function GuestStripV2({ copy }: { copy: string }) {
  return (
    <div className={`${v2Theme.panel} flex flex-wrap items-center justify-between gap-3 px-4 py-3`}>
      <div className="flex items-center gap-2 text-[11px] text-[#657084]">
        <span className="rounded-md border border-[rgba(42,53,69,0.6)] bg-[#0f1520] px-2 py-1 text-[10px] uppercase tracking-[0.14em]">
          Guest
        </span>
        <span>{copy}</span>
      </div>
      <Link
        href="#"
        className="inline-flex items-center rounded-lg border border-cyan-400/18 bg-[rgba(0,161,255,0.08)] px-3 py-2 text-[11px] font-medium text-cyan-200"
      >
        Sign in
      </Link>
    </div>
  );
}

export function StatePanelV2({
  title,
  body,
  ctaLabel,
  ctaHref,
}: {
  title: string;
  body: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  return (
    <section className={`${v2Theme.panel} px-6 py-10 text-center`}>
      <p className={v2Theme.kicker}>Unavailable</p>
      <h1 className="mt-3 text-2xl font-semibold text-[#f4f7fb]">{title}</h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#8b96a8]">{body}</p>
      {ctaLabel && ctaHref ? (
        <div className="mt-6">
          <Link
            href={ctaHref}
            className="inline-flex items-center rounded-lg border border-cyan-400/18 bg-[rgba(0,161,255,0.08)] px-4 py-2 text-sm font-medium text-cyan-100"
          >
            {ctaLabel}
          </Link>
        </div>
      ) : null}
    </section>
  );
}

function MetaPill({
  children,
  mono = false,
  strong = false,
}: {
  children: ReactNode;
  mono?: boolean;
  strong?: boolean;
}) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-lg border border-[rgba(42,53,69,0.55)] bg-[#0d141d] px-3 text-[10px] ${
        mono ? "font-mono" : ""
      } ${strong ? "text-[#dce5ef]" : "text-[#657084]"}`}
    >
      {children}
    </span>
  );
}

function StatusPill({ children, dotClass }: { children: ReactNode; dotClass: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-lg border border-[rgba(42,53,69,0.55)] bg-[#0d141d] px-3 text-[9px] font-medium uppercase tracking-[0.14em] text-[#657084]">
      <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
      {children}
    </span>
  );
}
