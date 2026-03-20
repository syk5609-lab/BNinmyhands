import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Activity, ArrowLeft, MessageSquare, Send, Shield, Clock, Users } from 'lucide-react';
import { useAuth } from '../data/authContext';
import { getCommunityPosts, type CommunityPost } from '../data/communityData';
import { isFeatureEnabled } from '../data/featureFlags';
import { FeatureDisabledPage } from '../components/shared/FeatureGate';
import { GuestGate } from '../components/shared/GuestGate';
import { SponsoredSlot } from '../components/shared/SponsoredSlot';
import { Disclaimer } from '../components/shared/PageShell';

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
const bucketLabel: Record<string, string> = {
  breakout_watch: 'Breakout',
  positioning_build: 'Positioning',
  squeeze_watch: 'Squeeze',
  overheat_risk: 'Overheat',
};

export function Community() {
  const navigate = useNavigate();

  if (!isFeatureEnabled('communityEnabled')) {
    return <FeatureDisabledPage label="Community is not available yet" />;
  }

  return (
    <div className="min-h-screen bg-[#06090f] text-gray-100 flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-[#1e2a3a]/80" style={{ background: 'linear-gradient(180deg, #080d14 0%, #0a1019 100%)' }}>
        <div className="max-w-[1600px] mx-auto flex items-center justify-between flex-wrap gap-3 px-5 py-2.5">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/')} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-cyan-400 transition-colors px-2 py-1 rounded hover:bg-cyan-500/5" style={{ fontWeight: 500 }}>
              <ArrowLeft className="w-3.5 h-3.5" /> Scanner
            </button>
            <div className="h-4 w-px bg-[#1e2a3a]" />
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <span className="text-[14px] text-gray-200" style={{ fontWeight: 600 }}>Community</span>
            </div>
            <span className="text-[10px] text-gray-600 uppercase tracking-[0.12em]" style={{ fontWeight: 500 }}>Latest Discussion</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 border border-cyan-500/20 flex items-center justify-center">
              <Activity className="w-3 h-3 text-cyan-400/70" />
            </div>
            <span className="text-[11px] text-gray-500 tracking-tight" style={{ fontWeight: 500 }}>BNinmyhands</span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-5 py-5 flex-1 w-full flex flex-col gap-5">
        {/* Info banner */}
        <div className="rounded-lg border border-[#1e2a3a]/60 bg-[#0c1018] px-4 py-3 flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-gray-500/5 border border-gray-600/15 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5 text-gray-600" />
          </div>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            Analysis-support discussion only. Share derivatives insights, signal interpretations, and setup observations. No hype, no price targets, no financial advice.
          </p>
        </div>

        {/* Compose area — gated to logged-in users */}
        <GuestGate action="post in the community">
          <ComposeArea />
        </GuestGate>

        {/* Sponsored slot */}
        <SponsoredSlot />

        {/* Feed */}
        <PostFeed />
      </div>

      <Disclaimer />
    </div>
  );
}

function ComposeArea() {
  const { user } = useAuth();
  const [draft, setDraft] = useState('');

  if (!user) return null;

  return (
    <div className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-4">
      <div className="flex gap-3">
        <div className="w-7 h-7 rounded-md bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-[10px] text-cyan-400" style={{ fontWeight: 600 }}>
            {user.displayName.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1">
          <textarea
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Share an analysis observation..."
            rows={3}
            className="w-full bg-[#0a0f16] border border-[#1e2a3a] rounded-lg px-3 py-2.5 text-[12px] text-gray-300 placeholder:text-gray-700 resize-none focus:outline-none focus:border-cyan-500/30 transition-colors"
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-700">Analytical context only</span>
            <button
              disabled={!draft.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/15"
              style={{ fontWeight: 500 }}
            >
              <Send className="w-3 h-3" /> Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostFeed() {
  const navigate = useNavigate();
  const posts = useMemo(() => getCommunityPosts().sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ), []);

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-12 text-center">
        <MessageSquare className="w-6 h-6 text-gray-700 mx-auto mb-3" />
        <p className="text-[13px] text-gray-500" style={{ fontWeight: 500 }}>No posts yet</p>
        <p className="text-[11px] text-gray-700 mt-1">Be the first to share an analysis observation.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2 mb-0.5">
        <Clock className="w-3.5 h-3.5 text-gray-700" />
        <span className="text-[10px] text-gray-600 uppercase tracking-[0.12em]" style={{ fontWeight: 500 }}>Latest Posts</span>
        <span className="text-[10px] text-gray-700">·</span>
        <span className="text-[10px] text-gray-700">{posts.length} posts</span>
      </div>
      {posts.map(post => (
        <div
          key={post.id}
          className="rounded-lg border border-[#1e2a3a] bg-[#0c1018] p-4 hover:bg-[#0d1119] transition-colors"
        >
          {/* Post header */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="w-6 h-6 rounded-md bg-gray-800 border border-[#1e2a3a] flex items-center justify-center">
              <span className="text-[9px] text-gray-500" style={{ fontWeight: 600 }}>
                {post.authorName.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-[12px] text-gray-300" style={{ fontWeight: 500 }}>{post.authorName}</span>
            {post.authorRole === 'admin' && (
              <span className="text-[8px] text-amber-400 bg-amber-500/10 border border-amber-500/15 px-1.5 py-0.5 rounded uppercase tracking-wider" style={{ fontWeight: 600 }}>
                Team
              </span>
            )}
            <span className="text-[10px] text-gray-700">{timeAgo(post.createdAt)}</span>

            {/* Context badges */}
            <div className="flex items-center gap-1.5 ml-auto">
              {post.symbol && (
                <button
                  onClick={() => post.runId && post.timeframe && navigate(`/coin/${post.symbol}?timeframe=${post.timeframe}&run_id=${post.runId}`)}
                  className="text-[10px] text-gray-400 bg-[#141a24] border border-[#1e2a3a]/60 px-2 py-0.5 rounded hover:text-cyan-400 hover:border-cyan-500/20 transition-colors cursor-pointer"
                  style={{ fontWeight: 500 }}
                >
                  {post.symbol}
                </button>
              )}
              {post.bucket && (
                <span className="flex items-center gap-1 text-[9px] text-gray-600">
                  <span className={`w-1.5 h-1.5 rounded-full ${bucketDot[post.bucket] || 'bg-gray-600'}`} />
                  {bucketLabel[post.bucket] || post.bucket}
                </span>
              )}
              {post.timeframe && (
                <span className="text-[9px] text-gray-600 bg-[#141a24] px-1.5 py-0.5 rounded" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {post.timeframe}
                </span>
              )}
            </div>
          </div>

          {/* Post body — community surface distinction */}
          <p className="text-[12px] text-gray-400 leading-relaxed pl-8">{post.content}</p>
        </div>
      ))}
    </div>
  );
}
