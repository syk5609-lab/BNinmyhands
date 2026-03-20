export function TrustNote({
  title = "Research / educational use only.",
  body = "Not financial advice. Signals, community notes, and sponsored placements may be delayed, incomplete, or wrong.",
  className = "",
}: {
  title?: string;
  body?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[18px] border border-[color:var(--bn-border)] bg-[linear-gradient(180deg,rgba(10,15,22,0.92),rgba(10,15,22,0.72))] px-4 py-3 text-sm shadow-[0_18px_40px_rgba(0,0,0,0.22)] ${className}`.trim()}
    >
      <p className="text-[11px] font-medium tracking-[0.02em] text-[var(--bn-text-strong)]">{title}</p>
      <p className="mt-2 text-[13px] leading-6 text-[color:var(--bn-text-muted)]">{body}</p>
    </div>
  );
}
