import "@/components/rebuild/foundation/rebuild-tokens.css";

import { StatePanel } from "@/components/rebuild/common/state-panel";
import { RebuildShell } from "@/components/rebuild/layout/rebuild-shell";

export default function Loading() {
  return (
    <div className="rebuild-preview">
      <RebuildShell>
        <section className="rb-panel">
          <StatePanel
            actionHref="/"
            actionLabel="Reload workspace"
            body="최신 persisted run 구조를 기준으로 라이브 스캐너 워크스페이스를 준비하는 중입니다."
            kicker="Dashboard loading"
            title="Scanner workspace is preparing"
          >
            <div className="rb-skeleton-grid">
              {Array.from({ length: 4 }).map((_, index) => (
                <div className="rb-skeleton" key={index} />
              ))}
            </div>
          </StatePanel>
        </section>
      </RebuildShell>
    </div>
  );
}
