export type ScannerTimeframe = "1h" | "4h" | "24h";

export interface SymbolScanResult {
  symbol: string;
  last_price: number;
  price_change_percent_24h: number;
  quote_volume_24h: number;
  heat_score: number;
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
