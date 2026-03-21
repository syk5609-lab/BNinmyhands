import { useState, useEffect, useMemo } from 'react';
import { MessageSquare, Send, Shield, Trash2, Flag, LogIn, Loader2, Lock, Users } from 'lucide-react';
import { useAuth } from '../../data/authContext';
import { useNavigate } from 'react-router';
import { getPostsForSymbol, type CommunityPost } from '../../data/communityData';
import { isFeatureEnabled } from '../../data/featureFlags';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const bucketDot: Record<string, string> = {
  breakout_watch: 'bg-cyan-400',
  positioning_build: 'bg-violet-400',
  squeeze_watch: 'bg-amber-400',
  overheat_risk: 'bg-red-400',
};

// ── Main export ─────────────────────────────────────────
export function DiscussionBlock({ symbol }: { symbol: string }) {
  // Feature-disabled state
  if (!isFeatureEnabled('discussionEnabled')) {
    return (
      <section>
        <DiscussionSectionHeader count={0} />
        <div
          className="rounded-lg border border-[#1a2435]/80 bg-[#090e15] p-8 text-center"
          style={{ borderLeft: '2px solid rgba(100,116,139,0.12)', fontFamily: 'Inter, sans-serif' }}
        >
          <div className="w-10 h-10 rounded-xl bg-gray-500/5 border border-gray-600/15 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-4 h-4 text-gray-600" />
          </div>
          <p className="text-[13px] text-gray-400" style={{ fontWeight: 500 }}>
            Discussion is not available yet
          </p>
          <p className="text-[11px] text-gray-600 mt-1">
            This feature may be enabled in a future update.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section>
      <DiscussionInner symbol={symbol} />
    </section>
  );
}

// ── Section header ──────────────────────────────────────
function DiscussionSectionHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-2.5 mb-2.5" style={{ fontFamily: 'Inter, sans-serif' }}>
      <h3 className="text-[10px] text-gray-600 uppercase tracking-[0.15em]" style={{ fontWeight: 500 }}>
        Discussion
      </h3>
      {count > 0 && (
        <>
          <span className="text-[10px] text-gray-700">·</span>
          <span className="text-[10px] text-gray-600" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
            {count}
          </span>
        </>
      )}
      <span className="text-[10px] text-gray-700 ml-auto hidden sm:inline">
        Analysis-support only
      </span>
    </div>
  );
}

// ── Inner — handles loading, guest read, logged-in write ──
function DiscussionInner({ symbol }: { symbol: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [serverPosts, setServerPosts] = useState<CommunityPost[]>([]);
  const [localPosts, setLocalPosts] = useState<CommunityPost[]>([]);
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState('');

  // Simulate loading discussion data
  useEffect(() => {
    setLoadingPosts(true);
    const t = setTimeout(() => {
      setServerPosts(getPostsForSymbol(symbol));
      setLoadingPosts(false);
    }, 400);
    return () => clearTimeout(t);
  }, [symbol]);

  const allPosts = useMemo(() => {
    return [...localPosts, ...serverPosts]
      .filter(p => !deletedIds.has(p.id))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [localPosts, serverPosts, deletedIds]);

  const handleSubmit = () => {
    if (!draft.trim() || !user) return;
    const newPost: CommunityPost = {
      id: 'p_local_' + Date.now(),
      authorName: user.displayName,
      authorRole: user.role,
      symbol: symbol.toUpperCase(),
      bucket: null,
      content: draft.trim(),
      createdAt: new Date().toISOString(),
      runId: null,
      timeframe: null,
    };
    setLocalPosts(prev => [newPost, ...prev]);
    setDraft('');
  };

  const handleDelete = (id: string) => {
    setDeletedIds(prev => new Set(prev).add(id));
  };

  const handleReport = (id: string) => {
    setReportedIds(prev => new Set(prev).add(id));
  };

  return (
    <>
      <DiscussionSectionHeader count={loadingPosts ? 0 : allPosts.length} />

      {/* Discussion container — visually distinct from analysis cards */}
      <div
        className="rounded-lg border border-[#1a2435]/80 bg-[#090e15] overflow-hidden"
        style={{ borderLeft: '2px solid rgba(100,116,139,0.12)', fontFamily: 'Inter, sans-serif' }}
      >
        {/* ── Composer or Guest CTA ── */}
        {user ? (
          <div className="p-4 border-b border-[#1a2435]/60">
            <div className="flex gap-3">
              <div className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] text-cyan-400" style={{ fontWeight: 600 }}>
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  placeholder={`Share analysis on ${symbol}...`}
                  rows={2}
                  className="w-full bg-[#070c12] border border-[#1a2435] rounded-lg px-3 py-2 text-[12px] text-gray-300 placeholder:text-gray-700 resize-none focus:outline-none focus:border-cyan-500/25 transition-colors"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-gray-700 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Keep it analytical. No hype.
                  </span>
                  <button
                    onClick={handleSubmit}
                    disabled={!draft.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg transition-colors disabled:opacity-25 disabled:cursor-not-allowed bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15"
                    style={{ fontWeight: 500 }}
                  >
                    <Send className="w-3 h-3" />
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Guest CTA — soft, not blocking. Users can still read below. */
          <div className="px-4 py-3.5 border-b border-[#1a2435]/60 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-md bg-gray-500/5 border border-[#1e2a3a] flex items-center justify-center shrink-0">
                <Users className="w-3.5 h-3.5 text-gray-600" />
              </div>
              <span className="text-[11px] text-gray-500">
                Sign in to share your analysis on {symbol}
              </span>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] text-cyan-400/80 bg-cyan-500/6 border border-cyan-500/15 rounded-lg hover:bg-cyan-500/12 transition-colors shrink-0"
              style={{ fontWeight: 500 }}
            >
              <LogIn className="w-3 h-3" />
              Sign In
            </button>
          </div>
        )}

        {/* ── Loading state ── */}
        {loadingPosts && (
          <div className="p-8 flex flex-col items-center justify-center gap-2.5">
            <Loader2 className="w-4 h-4 animate-spin text-gray-600" />
            <span className="text-[11px] text-gray-600">Loading discussion...</span>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loadingPosts && allPosts.length === 0 && (
          <div className="p-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-gray-500/4 border border-[#1e2a3a]/60 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-4 h-4 text-gray-700" />
            </div>
            <p className="text-[12px] text-gray-500" style={{ fontWeight: 500 }}>
              No discussion yet for {symbol}
            </p>
            <p className="text-[10px] text-gray-700 mt-1">
              {user ? 'Be the first to share analysis.' : 'Sign in to start the conversation.'}
            </p>
          </div>
        )}

        {/* ── Post list — latest-first ── */}
        {!loadingPosts && allPosts.length > 0 && (
          <div>
            {allPosts.map(post => {
              const isOwn = user && post.authorName === user.displayName;
              const isReported = reportedIds.has(post.id);
              return (
                <div
                  key={post.id}
                  className="group px-4 py-3.5 border-b border-[#1a2435]/40 last:border-b-0 transition-colors hover:bg-[#0a1018]/60"
                >
                  {/* Post header row */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded bg-[#111827] border border-[#1e2a3a]/60 flex items-center justify-center shrink-0">
                      <span className="text-[8px] text-gray-500" style={{ fontWeight: 600 }}>
                        {post.authorName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-[11px] text-gray-300" style={{ fontWeight: 500 }}>
                      {post.authorName}
                    </span>
                    {post.authorRole === 'admin' && (
                      <span
                        className="text-[8px] text-amber-400/80 bg-amber-500/8 border border-amber-500/12 px-1.5 py-0.5 rounded uppercase tracking-wider"
                        style={{ fontWeight: 600 }}
                      >
                        Team
                      </span>
                    )}
                    <span className="text-[10px] text-gray-700">{timeAgo(post.createdAt)}</span>

                    {/* Context badges */}
                    {post.bucket && (
                      <span className={`w-1.5 h-1.5 rounded-full ${bucketDot[post.bucket] || 'bg-gray-600'}`} />
                    )}
                    {post.timeframe && (
                      <span className="text-[9px] text-gray-600 bg-[#111827] px-1.5 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {post.timeframe}
                      </span>
                    )}

                    {/* Actions — right side, on hover */}
                    <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {isOwn ? (
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-1 rounded text-gray-700 hover:text-red-400/70 hover:bg-red-500/5 transition-colors"
                          title="Delete your post"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      ) : user ? (
                        <button
                          onClick={() => handleReport(post.id)}
                          disabled={isReported}
                          className={`p-1 rounded transition-colors ${
                            isReported
                              ? 'text-amber-500/40 cursor-default'
                              : 'text-gray-700 hover:text-amber-400/70 hover:bg-amber-500/5'
                          }`}
                          title={isReported ? 'Reported' : 'Report post'}
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {/* Post body */}
                  <p className="text-[12px] text-gray-400 leading-relaxed pl-7">
                    {post.content}
                  </p>

                  {/* Reported confirmation */}
                  {isReported && (
                    <p className="text-[10px] text-amber-500/50 pl-7 mt-1">
                      Reported — thank you for helping keep discussion analytical.
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
