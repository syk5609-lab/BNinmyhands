import Link from "next/link";

export function StatePanel({
  kicker,
  title,
  body,
  actionHref,
  actionLabel,
  children,
}: {
  kicker: string;
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="rb-state">
      <p className="rb-state__kicker">{kicker}</p>
      <h1 className="rb-state__title">{title}</h1>
      <p className="rb-state__body">{body}</p>
      {actionHref && actionLabel ? (
        <Link className="rb-state__action" href={actionHref}>
          {actionLabel}
        </Link>
      ) : null}
      {children}
    </section>
  );
}
