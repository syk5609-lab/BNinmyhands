import Link from "next/link";

import { REBUILD_DISCUSSION_GUEST } from "@/fixtures/rebuild/runtime.fixture";

export function DiscussionPanel({
  title,
  posts,
  guest,
  actionLabel,
  actionHref,
  statusMessage,
}: {
  title: string;
  posts: Array<{
    author: string;
    role: string;
    body: string;
    meta: string;
  }>;
  guest: boolean;
  actionLabel?: string;
  actionHref?: string;
  statusMessage?: string;
}) {
  return (
    <section className="rb-panel">
      <div className="rb-panel__inner">
        <div className="rb-panel__header">
          <div>
            <p className="rb-mini">Discussion</p>
            <h2 className="rb-title">{title}</h2>
          </div>
          {actionHref ? (
            <Link className="rb-header__action" href={actionHref}>
              {actionLabel ?? "Log in to write"}
            </Link>
          ) : (
            <span className="rb-header__action">{actionLabel ?? (guest ? "Log in to write" : "Write enabled")}</span>
          )}
        </div>
        {guest ? <div className="rb-guest-strip">{REBUILD_DISCUSSION_GUEST}</div> : null}
        {statusMessage ? <div className="rb-guest-strip">{statusMessage}</div> : null}
        <div>
          {posts.map((post) => (
            <article className="rb-discussion-post" key={`${post.author}-${post.meta}`}>
              <div className="rb-discussion-post__top">
                <div>
                  <span className="rb-discussion-post__author">{post.author}</span>
                  <span className="rb-discussion-post__role"> · {post.role}</span>
                </div>
                <span className="rb-mini">{post.meta}</span>
              </div>
              <p className="rb-copy">{post.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
