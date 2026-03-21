export function RebuildShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="rb-shell">
      <div className="rb-shell__inner">
        <div className="rb-stack">{children}</div>
      </div>
    </div>
  );
}
