export type AdPlacement = "dashboard_top" | "dashboard_mid" | "detail_bottom";
export type AdCreativeStatus = "draft" | "active" | "paused" | "archived";
export type AdEventType = "impression" | "click";

export interface AdCreativeRender {
  id: number;
  title: string;
  body_copy: string | null;
  image_url: string | null;
  target_url: string;
  cta_label: string | null;
}

export interface AdSlotRender {
  id: number;
  placement: AdPlacement;
  label: string;
  creative: AdCreativeRender;
}

export interface AdminAdSlot {
  id: number;
  placement: AdPlacement;
  label: string;
  enabled: boolean;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface AdminAdCreative {
  id: number;
  slot_id: number;
  slot_placement: AdPlacement;
  title: string;
  body_copy: string | null;
  image_url: string | null;
  target_url: string;
  cta_label: string | null;
  status: AdCreativeStatus;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
}
