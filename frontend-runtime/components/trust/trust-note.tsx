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
    <div className={`rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-zinc-400 ${className}`.trim()}>
      <p className="font-medium text-zinc-200">{title}</p>
      <p className="mt-1 leading-6">{body}</p>
    </div>
  );
}
