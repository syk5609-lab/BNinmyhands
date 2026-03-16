import {
  AssetHistoryResponse,
  AssetLatestResponse,
  ResearchRunDetail,
  ResearchRunSummary,
  ScanResponse,
  ScannerTimeframe,
} from "@/lib/types/scanner";

const DEFAULT_BASE_URL = "http://127.0.0.1:8000";

export class ScannerApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = "ScannerApiError";
    this.status = status;
    this.details = details;
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const baseUrl = process.env.SCANNER_API_BASE_URL ?? DEFAULT_BASE_URL;
  const response = await fetch(`${baseUrl}${path}`, { cache: "no-store" });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ScannerApiError("Failed to fetch scanner data.", response.status, payload);
  }

  return payload as T;
}

export async function fetchTodayScan(params: {
  limit: number;
  volumePercentile: number;
  timeframe: ScannerTimeframe;
}): Promise<ScanResponse> {
  const search = new URLSearchParams({
    limit: String(params.limit),
    volume_percentile: String(params.volumePercentile),
    timeframe: params.timeframe,
  });
  return fetchJson<ScanResponse>(`/api/scan/today?${search.toString()}`);
}

export async function fetchResearchRuns(timeframe: ScannerTimeframe): Promise<ResearchRunSummary[]> {
  const search = new URLSearchParams({ timeframe });
  return fetchJson<ResearchRunSummary[]>(`/api/research/runs?${search.toString()}`);
}

export async function fetchResearchRunDetail(runId: number): Promise<ResearchRunDetail> {
  return fetchJson<ResearchRunDetail>(`/api/research/runs/${runId}`);
}

export async function fetchAssetLatest(symbol: string, timeframe: ScannerTimeframe): Promise<AssetLatestResponse> {
  const search = new URLSearchParams({ timeframe });
  return fetchJson<AssetLatestResponse>(`/api/assets/${encodeURIComponent(symbol)}/latest?${search.toString()}`);
}

export async function fetchAssetHistory(
  symbol: string,
  timeframe: ScannerTimeframe,
  limit: number = 200,
): Promise<AssetHistoryResponse> {
  const search = new URLSearchParams({ timeframe, limit: String(limit) });
  return fetchJson<AssetHistoryResponse>(`/api/assets/${encodeURIComponent(symbol)}/history?${search.toString()}`);
}
