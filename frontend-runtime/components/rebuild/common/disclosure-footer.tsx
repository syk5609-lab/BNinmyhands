import { REBUILD_FOOTER_COPY } from "@/fixtures/rebuild/runtime.fixture";

export function DisclosureFooter() {
  return (
    <footer className="rb-footer">
      <span>{REBUILD_FOOTER_COPY.disclaimer}</span>
      <span>{REBUILD_FOOTER_COPY.detail}</span>
    </footer>
  );
}
