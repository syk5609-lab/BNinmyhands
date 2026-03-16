export type ScannerTimeframe = "1h" | "4h" | "24h";

export interface SymbolScanResult {
  symbol: string;
  last_price: number;
  price_change_percent_24h: number;
  quote_volume_24h: number;
  heat_score: number;
  momentum_score: number;
  setup_score: number;
  positioning_score: number;
  early_signal_score: number;
  risk_penalty: number;
  composite_score: number;
  oi_change_percent_recent: number | null;
  taker_net_flow_recent: number | null;
  long_short_ratio_recent: number | null;
}

export interface ScanResponse {
  generated_at: string;
  limit: number;
  volume_percentile: number;
  results: SymbolScanResult[];
}

export interface ResearchRunSummary {
  id: number;
  timeframe: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  row_count: number;
}

export interface ResearchRunDetail {
  id: number;
  timeframe: string;
  started_at: string;
  finished_at: string | null;
  status: string;
  limit: number;
  volume_percentile: number;
  rows: SymbolScanResult[];
}

export interface AssetLatestResponse {
  symbol: string;
  ts: string;
  row: SymbolScanResult;
}

export interface AssetHistoryPoint {
  ts: string;
  last_price: number;
  composite_score: number;
  momentum_score: number;
  setup_score: number;
}

export interface AssetHistoryResponse {
  symbol: string;
  points: AssetHistoryPoint[];
}
