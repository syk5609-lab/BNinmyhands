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

function rand(min: number, max: number) { return Math.random() * (max - min) + min; }
function pick<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

export function generateMockData(): CoinData[] {
  return symbols.map((symbol, i) => {
    const bucket = buckets[i % 4];
    const isPump = Math.random() > 0.5;
    return {
      rank: i + 1,
      symbol,
      bucket,
      reasons: pick(reasonTags[bucket], Math.floor(rand(1, 4))),
      last: prices[symbol] || rand(1, 100),
      change24h: rand(-15, 25),
      volume: rand(10, 800) * 1e6,
      compositeDelta: rand(-5, 8),
      rankDelta: Math.floor(rand(-10, 10)),
      oiPercent: rand(-20, 40),
      takerFlow: rand(-50, 50),
      lsRatio: rand(0.5, 3.0),
      composite: rand(20, 95),
      momentum: rand(10, 95),
      setup: rand(15, 90),
      positioning: rand(10, 90),
      riskPenalty: rand(0, 40),
      funding: rand(-0.05, 0.15),
      isPump,
    };
  });
}

export function getRunContext(timeframe: Timeframe): RunContext {
  return {
    timeframe,
    lastUpdated: new Date().toISOString(),
    dataAge: '2m 14s',
    run_id: 'run_' + Math.random().toString(36).slice(2, 10),
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
  const fundingVal = rand(-0.06, 0.15);
  const fundDir: CoinDetailData['fundingDirection'] = fundingVal > 0.02 ? 'positive' : fundingVal < -0.01 ? 'negative' : 'neutral';

  return {
    symbol,
    bucket,
    reasons: pick(reasonTags[bucket], Math.floor(rand(2, 4))),
    reasonExplanation: pick(reasonExplanations[bucket], 1)[0],
    last: prices[symbol] || rand(1, 100),
    change24h: rand(-15, 25),
    volume: rand(10, 800) * 1e6,
    prevRank: Math.floor(rand(1, 30)),
    rankDelta: Math.floor(rand(-8, 8)),
    compositeDelta: rand(-5, 8),
    setupDelta: rand(-4, 6),
    positioningDelta: rand(-6, 7),
    oiPercent: rand(-20, 40),
    takerFlow: rand(-50, 50),
    lsRatio: rand(0.5, 3.0),
    composite: rand(25, 95),
    momentum: rand(15, 95),
    setup: rand(15, 90),
    positioning: rand(10, 90),
    riskPenalty: rand(0, 40),
    dataQuality: rand(70, 100),
    funding: fundingVal,
    fundingDirection: fundDir,
    crowdedInterpretation: crowdedTexts[fundDir],
    riskNote: riskNotes[fundDir],
  };
}

export function generateHistory(symbol: string): HistoryRow[] {
  if (!symbols.includes(symbol)) return [];
  const basePrice = prices[symbol] || 10;
  const now = Date.now();
  return Array.from({ length: 12 }, (_, i) => ({
    timestamp: new Date(now - (11 - i) * 15 * 60 * 1000).toISOString(),
    last: basePrice * (1 + rand(-0.03, 0.03)),
    composite: rand(20, 95),
    setup: rand(15, 90),
    positioning: rand(10, 90),
    oiPercent: rand(-15, 35),
    flow: rand(-50, 50),
    lsRatio: rand(0.5, 3.0),
    riskPenalty: rand(0, 35),
    funding: rand(-0.05, 0.12),
  }));
}

export const validSymbols = symbols;