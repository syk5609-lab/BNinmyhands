const PREVIEW_BASE_TIME = '2026-03-20T20:50:22.000Z';
export type Timeframe = '1h' | '4h' | '24h';
export type Bucket = 'breakout_watch' | 'positioning_build' | 'squeeze_watch' | 'overheat_risk';
export type Preset = 'breakout' | 'positioning' | 'squeeze' | 'overheat';
export type RunStatus = 'complete' | 'partial';

export interface RunContext {
  timeframe: Timeframe;
  lastUpdated: string;
  dataAge: string;
  run_id: string;
  run_status: RunStatus;
  ingestionHealth: 'healthy' | 'degraded' | 'down';
  symbolCount: number;
}

export interface CoinData {
  rank: number;
  symbol: string;
  bucket: Bucket;
  reasons: string[];
  last: number;
  change24h: number;
  volume: number;
  compositeDelta: number;
  rankDelta: number;
  oiPercent: number;
  takerFlow: number;
  lsRatio: number;
  composite: number;
  momentum: number;
  setup: number;
  positioning: number;
  riskPenalty: number;
  funding: number;
  isPump: boolean;
}

export const presetConfig: Record<Preset, {
  label: string;
  defaultBucket: Bucket;
  defaultSort: keyof CoinData;
  emphasizedColumns: string[];
  explanation: string;
}> = {
  breakout: {
    label: 'Breakout View',
    defaultBucket: 'breakout_watch',
    defaultSort: 'composite',
    emphasizedColumns: ['composite', 'momentum', 'volume', 'compositeDelta'],
    explanation: 'Sorted by composite score. Highlights coins with strong momentum, rising volume, and technical breakout setups.',
  },
  positioning: {
    label: 'Positioning Build View',
    defaultBucket: 'positioning_build',
    defaultSort: 'positioning',
    emphasizedColumns: ['positioning', 'oiPercent', 'takerFlow', 'lsRatio'],
    explanation: 'Sorted by positioning score. Highlights coins where smart money is building positions — rising OI, taker flow imbalance, and L/S shifts.',
  },
  squeeze: {
    label: 'Squeeze Watch View',
    defaultBucket: 'squeeze_watch',
    defaultSort: 'setup',
    emphasizedColumns: ['setup', 'funding', 'lsRatio', 'oiPercent'],
    explanation: 'Sorted by setup score. Identifies potential squeeze candidates with crowded positioning, extreme funding, and low liquidity pockets.',
  },
  overheat: {
    label: 'Overheat Risk View',
    defaultBucket: 'overheat_risk',
    defaultSort: 'riskPenalty',
    emphasizedColumns: ['riskPenalty', 'funding', 'oiPercent', 'change24h'],
    explanation: 'Sorted by risk penalty (descending). Flags overheated coins with extreme funding, rapid OI growth, and extended price moves.',
  },
};

const symbols = [
  'BTC', 'ETH', 'SOL', 'DOGE', 'XRP', 'ADA', 'AVAX', 'LINK', 'DOT', 'MATIC',
  'ARB', 'OP', 'APT', 'SUI', 'SEI', 'INJ', 'TIA', 'JUP', 'WIF', 'PEPE',
  'FET', 'RNDR', 'NEAR', 'FIL', 'ATOM', 'UNI', 'AAVE', 'MKR', 'LDO', 'STX',
];

const buckets: Bucket[] = ['breakout_watch', 'positioning_build', 'squeeze_watch', 'overheat_risk'];
const reasonTags: Record<Bucket, string[]> = {
  breakout_watch: ['vol_surge', 'range_break', 'momentum_flip', 'oi_ramp', 'taker_bid'],
  positioning_build: ['oi_build', 'whale_flow', 'ls_shift', 'stealth_bid', 'accumulation'],
  squeeze_watch: ['crowded_short', 'funding_extreme', 'low_liq', 'gamma_wall', 'oi_spike'],
  overheat_risk: ['funding_hot', 'oi_overextend', 'price_extended', 'liq_cascade', 'divergence'],
};

const prices: Record<string, number> = {
  BTC: 97245, ETH: 3842, SOL: 187.4, DOGE: 0.1823, XRP: 2.34, ADA: 0.72, AVAX: 38.9,
  LINK: 18.45, DOT: 7.82, MATIC: 0.89, ARB: 1.24, OP: 2.87, APT: 12.34, SUI: 3.45,
  SEI: 0.56, INJ: 28.9, TIA: 9.87, JUP: 1.12, WIF: 2.34, PEPE: 0.0000123,
  FET: 2.18, RNDR: 8.45, NEAR: 6.78, FIL: 5.67, ATOM: 9.12, UNI: 12.3, AAVE: 289,
  MKR: 1890, LDO: 2.34, STX: 1.89,
};

function seeded(symbol: string, salt = 0) {
  return [...`${symbol}:${salt}`].reduce((acc, char) => acc + char.charCodeAt(0), 0);
}
function rand(min: number, max: number, seed: number) {
  const normalized = ((seed * 9301 + 49297) % 233280) / 233280;
  return normalized * (max - min) + min;
}
function pick<T>(arr: T[], n: number, seed: number): T[] {
  return [...arr]
    .map((value, index) => ({ value, score: seeded(String(value), seed + index) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, n)
    .map((item) => item.value);
}

export function generateMockData(): CoinData[] {
  return symbols.map((symbol, i) => {
    const bucket = buckets[i % 4];
    const baseSeed = seeded(symbol, i);
    const isPump = baseSeed % 2 === 0;
    return {
      rank: i + 1,
      symbol,
      bucket,
      reasons: pick(reasonTags[bucket], Math.max(1, Math.floor(rand(1, 4, baseSeed + 1))), baseSeed + 2),
      last: prices[symbol] || rand(1, 100, baseSeed + 3),
      change24h: rand(-15, 25, baseSeed + 4),
      volume: rand(10, 800, baseSeed + 5) * 1e6,
      compositeDelta: rand(-5, 8, baseSeed + 6),
      rankDelta: Math.floor(rand(-10, 10, baseSeed + 7)),
      oiPercent: rand(-20, 40, baseSeed + 8),
      takerFlow: rand(-50, 50, baseSeed + 9),
      lsRatio: rand(0.5, 3.0, baseSeed + 10),
      composite: rand(20, 95, baseSeed + 11),
      momentum: rand(10, 95, baseSeed + 12),
      setup: rand(15, 90, baseSeed + 13),
      positioning: rand(10, 90, baseSeed + 14),
      riskPenalty: rand(0, 40, baseSeed + 15),
      funding: rand(-0.05, 0.15, baseSeed + 16),
      isPump,
    };
  });
}

export function getRunContext(timeframe: Timeframe): RunContext {
  const updates: Record<Timeframe, string> = {
    '1h': '2026-03-20T20:50:22.000Z',
    '4h': '2026-03-20T20:50:22.000Z',
    '24h': '2026-03-20T20:50:22.000Z',
  };
  return {
    timeframe,
    lastUpdated: updates[timeframe],
    dataAge: '2m 14s',
    run_id: 'run_vptd5wa1',
    run_status: 'complete',
    ingestionHealth: 'healthy',
    symbolCount: 200,
  };
}

// --- Coin Detail types & generators ---

export interface CoinDetailData {
  symbol: string;
  bucket: Bucket;
  reasons: string[];
  reasonExplanation: string;
  last: number;
  change24h: number;
  volume: number;
  prevRank: number;
  rankDelta: number;
  compositeDelta: number;
  setupDelta: number;
  positioningDelta: number;
  oiPercent: number;
  takerFlow: number;
  lsRatio: number;
  composite: number;
  momentum: number;
  setup: number;
  positioning: number;
  riskPenalty: number;
  dataQuality: number;
  funding: number;
  fundingDirection: 'positive' | 'negative' | 'neutral';
  crowdedInterpretation: string;
  riskNote: string;
}

export interface HistoryRow {
  timestamp: string;
  last: number;
  composite: number;
  setup: number;
  positioning: number;
  oiPercent: number;
  flow: number;
  lsRatio: number;
  riskPenalty: number;
  funding: number;
}

const reasonExplanations: Record<Bucket, string[]> = {
  breakout_watch: [
    'Volume surged 3.2x above 20-period average while price broke above the 4h range high, coinciding with a momentum flip from negative to positive composite delta.',
    'Persistent taker bid pressure with OI ramping steadily — classic breakout accumulation pattern ahead of a range expansion.',
  ],
  positioning_build: [
    'Open interest building steadily over 6 consecutive candles with whale-sized taker buys detected. L/S ratio shifting toward longs suggests smart money accumulation.',
    'Stealth bid pattern detected — OI rising without significant price movement, indicating large limit orders absorbing supply.',
  ],
  squeeze_watch: [
    'Shorts are heavily crowded with funding deeply negative. A low-liquidity zone sits just above current price, creating ideal conditions for a short squeeze.',
    'Extreme negative funding combined with a gamma wall above price — any upward move could trigger cascading liquidations.',
  ],
  overheat_risk: [
    'Funding rate has reached extreme positive levels while OI has extended well beyond its 30-day average. Price is stretched 2+ standard deviations from VWAP.',
    'Liquidation cascade risk elevated — OI overextended with divergence forming between price and composite momentum.',
  ],
};

const crowdedTexts = {
  positive: 'Longs are dominant — funding premium suggests crowded long positioning. Watch for potential long squeeze if momentum fades.',
  negative: 'Shorts are dominant — negative funding indicates crowded short positioning. Vulnerable to a short squeeze on any catalyst.',
  neutral: 'Funding is near neutral — no clear crowding signal. Market is relatively balanced between longs and shorts.',
};

const riskNotes = {
  positive: 'Elevated long liquidation risk if price reverses. Consider tighter stops and reduced position size.',
  negative: 'Short squeeze risk is elevated. Funding discount may attract contrarian longs looking for a snap-back.',
  neutral: 'No extreme funding risk detected. Standard risk management applies.',
};

export function generateCoinDetail(symbol: string): CoinDetailData | null {
  if (!symbols.includes(symbol)) return null;
  const idx = symbols.indexOf(symbol);
  const bucket = buckets[idx % 4];
  const baseSeed = seeded(symbol, idx);
  const fundingVal = rand(-0.06, 0.15, baseSeed + 30);
  const fundDir: CoinDetailData['fundingDirection'] = fundingVal > 0.02 ? 'positive' : fundingVal < -0.01 ? 'negative' : 'neutral';

  return {
    symbol,
    bucket,
    reasons: pick(reasonTags[bucket], Math.max(2, Math.floor(rand(2, 4, baseSeed + 20))), baseSeed + 21),
    reasonExplanation: pick(reasonExplanations[bucket], 1, baseSeed + 22)[0],
    last: prices[symbol] || rand(1, 100, baseSeed + 23),
    change24h: rand(-15, 25, baseSeed + 24),
    volume: rand(10, 800, baseSeed + 25) * 1e6,
    prevRank: Math.floor(rand(1, 30, baseSeed + 26)),
    rankDelta: Math.floor(rand(-8, 8, baseSeed + 27)),
    compositeDelta: rand(-5, 8, baseSeed + 28),
    setupDelta: rand(-4, 6, baseSeed + 29),
    positioningDelta: rand(-6, 7, baseSeed + 31),
    oiPercent: rand(-20, 40, baseSeed + 32),
    takerFlow: rand(-50, 50, baseSeed + 33),
    lsRatio: rand(0.5, 3.0, baseSeed + 34),
    composite: rand(25, 95, baseSeed + 35),
    momentum: rand(15, 95, baseSeed + 36),
    setup: rand(15, 90, baseSeed + 37),
    positioning: rand(10, 90, baseSeed + 38),
    riskPenalty: rand(0, 40, baseSeed + 39),
    dataQuality: rand(70, 100, baseSeed + 40),
    funding: fundingVal,
    fundingDirection: fundDir,
    crowdedInterpretation: crowdedTexts[fundDir],
    riskNote: riskNotes[fundDir],
  };
}

export function generateHistory(symbol: string): HistoryRow[] {
  if (!symbols.includes(symbol)) return [];
  const basePrice = prices[symbol] || 10;
  const baseSeed = seeded(symbol, 90);
  const now = new Date(PREVIEW_BASE_TIME).getTime();
  return Array.from({ length: 12 }, (_, i) => ({
    timestamp: new Date(now - (11 - i) * 15 * 60 * 1000).toISOString(),
    last: basePrice * (1 + rand(-0.03, 0.03, baseSeed + i)),
    composite: rand(20, 95, baseSeed + 20 + i),
    setup: rand(15, 90, baseSeed + 40 + i),
    positioning: rand(10, 90, baseSeed + 60 + i),
    oiPercent: rand(-15, 35, baseSeed + 80 + i),
    flow: rand(-50, 50, baseSeed + 100 + i),
    lsRatio: rand(0.5, 3.0, baseSeed + 120 + i),
    riskPenalty: rand(0, 35, baseSeed + 140 + i),
    funding: rand(-0.05, 0.12, baseSeed + 160 + i),
  }));
}

export const validSymbols = symbols;
