import { ScanResponse, ScannerTimeframe } from "@/lib/types/scanner";

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

export async function fetchTodayScan(params: {
  limit: number;
  volumePercentile: number;
  timeframe: ScannerTimeframe;
}): Promise<ScanResponse> {
  const baseUrl = process.env.SCANNER_API_BASE_URL ?? DEFAULT_BASE_URL;
  const search = new URLSearchParams({
    limit: String(params.limit),
    volume_percentile: String(params.volumePercentile),
    timeframe: params.timeframe,
  });

  const response = await fetch(`${baseUrl}/api/scan/today?${search.toString()}`, {
    cache: "no-store",
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ScannerApiError("Failed to fetch scanner data.", response.status, payload);
  }

  return payload as ScanResponse;
}
