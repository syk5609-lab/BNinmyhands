import Link from "next/link";

import { RebuildSponsor } from "@/fixtures/rebuild/runtime.fixture";

export function SponsorSlot({ sponsor }: { sponsor: RebuildSponsor }) {
  return (
    <section className="rb-sponsor">
      <div className="rb-sponsor__row">
        <div>
          <span className="rb-sponsor__label">{sponsor.label}</span>
          <p className="rb-sponsor__eyebrow">{sponsor.eyebrow}</p>
          <h2 className="rb-sponsor__title">{sponsor.title}</h2>
          <p className="rb-sponsor__body">{sponsor.body}</p>
        </div>
        <Link className="rb-sponsor__cta" href={sponsor.href} rel="noreferrer noopener sponsored" target="_blank">
          {sponsor.cta}
        </Link>
      </div>
    </section>
  );
}
