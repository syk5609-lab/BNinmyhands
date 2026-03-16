import { PropsWithChildren } from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-xl border border-zinc-800 bg-zinc-900/70 ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={`border-b border-zinc-800 px-4 py-3 ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={`px-4 py-3 ${className}`}>{children}</div>;
}
