export type CommunityReportReason = "spam" | "impersonation" | "scam_or_promo" | "harassment" | "other";

export interface CommunityAuthor {
  id: number;
  nickname: string;
  role: string;
}

export interface CommunityPost {
  id: number;
  symbol: string;
  run_id: number | null;
  timeframe: string | null;
  body: string;
  status: "active" | "hidden" | "deleted";
  created_at: string;
  updated_at: string;
  author: CommunityAuthor;
}

export interface CommunityReport {
  id: number;
  reason: CommunityReportReason;
  status: "open" | "hidden" | "no_action" | "resolved";
  moderator_note: string | null;
  created_at: string;
  resolved_at: string | null;
  reporter: CommunityAuthor;
  post: CommunityPost;
}
