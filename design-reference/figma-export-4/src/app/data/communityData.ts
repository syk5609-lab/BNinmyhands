// Mock community discussion data

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole: 'user' | 'admin';
  symbol: string | null; // null = general discussion
  bucket: string | null;
  content: string;
  createdAt: string;
  runId: string | null;
  timeframe: string | null;
}

const mockPosts: CommunityPost[] = [
  {
    id: 'p_01', authorName: 'AlphaScanner', authorRole: 'user',
    symbol: 'SOL', bucket: 'breakout_watch',
    content: 'SOL breakout setup looks textbook — OI ramping on the 4h while taker flow is firmly bid-side. Volume surge confirmed above the 20-period average. Watching for a clean break above 192.',
    createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    runId: 'run_abc12345', timeframe: '4h',
  },
  {
    id: 'p_02', authorName: 'DerivTrader', authorRole: 'user',
    symbol: 'ETH', bucket: 'positioning_build',
    content: 'ETH positioning build is interesting — stealth accumulation pattern with OI rising but no real price movement. Whales are clearly loading. L/S ratio shifting quietly.',
    createdAt: new Date(Date.now() - 35 * 60000).toISOString(),
    runId: 'run_abc12345', timeframe: '4h',
  },
  {
    id: 'p_03', authorName: 'RiskWatcher', authorRole: 'user',
    symbol: 'DOGE', bucket: 'overheat_risk',
    content: 'DOGE overheat flag is warranted — funding is 0.08% and climbing. Price extended 2.5 sigma above VWAP. Classic overextension. Wouldn\'t chase this.',
    createdAt: new Date(Date.now() - 55 * 60000).toISOString(),
    runId: 'run_abc12345', timeframe: '1h',
  },
  {
    id: 'p_04', authorName: 'AdminOps', authorRole: 'admin',
    symbol: null, bucket: null,
    content: 'Scanner update: 24h timeframe ingestion delay resolved. All runs are now back to normal cadence. Apologies for the gap earlier today.',
    createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
    runId: null, timeframe: null,
  },
  {
    id: 'p_05', authorName: 'SqueezeHunter', authorRole: 'user',
    symbol: 'PEPE', bucket: 'squeeze_watch',
    content: 'PEPE squeeze setup on the 1h — shorts are heavily crowded with funding deeply negative at -0.04%. Low liquidity above current price. One catalyst away from a snap.',
    createdAt: new Date(Date.now() - 120 * 60000).toISOString(),
    runId: 'run_def67890', timeframe: '1h',
  },
  {
    id: 'p_06', authorName: 'StructureTrader', authorRole: 'user',
    symbol: 'ARB', bucket: 'breakout_watch',
    content: 'ARB composite score jumped from 42 to 78 in the last two runs. Momentum flip confirmed. This is the cleanest breakout candidate I\'ve seen this week.',
    createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
    runId: 'run_def67890', timeframe: '4h',
  },
  {
    id: 'p_07', authorName: 'FlowReader', authorRole: 'user',
    symbol: 'BTC', bucket: 'positioning_build',
    content: 'BTC whale flow is consistent and steady — not the usual retail frenzy. Positioning score at 82 is very high. The structure looks intentional.',
    createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
    runId: 'run_def67890', timeframe: '24h',
  },
];

export function getCommunityPosts(): CommunityPost[] {
  return [...mockPosts];
}

export function getPostsForSymbol(symbol: string): CommunityPost[] {
  return mockPosts.filter(p => p.symbol === symbol.toUpperCase());
}

// Mock sponsored ads
export interface SponsoredAd {
  id: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
  advertiser: string;
}

const mockAds: SponsoredAd[] = [
  {
    id: 'ad_01',
    title: 'Institutional-Grade Data API',
    description: 'Access real-time derivatives data for 500+ pairs. REST & WebSocket endpoints with 99.9% uptime SLA.',
    ctaLabel: 'Learn More',
    ctaUrl: '#',
    advertiser: 'DataVault Pro',
  },
  {
    id: 'ad_02',
    title: 'Risk Management Platform',
    description: 'Automated position sizing, liquidation alerts, and portfolio heat maps for derivatives traders.',
    ctaLabel: 'Try Free',
    ctaUrl: '#',
    advertiser: 'RiskShield',
  },
];

export function getSponsoredAd(): SponsoredAd {
  return mockAds[Math.floor(Math.random() * mockAds.length)];
}

export function getAdBySlot(slot: number): SponsoredAd {
  return mockAds[slot % mockAds.length];
}