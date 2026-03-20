export type FeatureFlagKey = "community_enabled" | "ads_enabled" | "write_actions_enabled";

export interface RuntimeFeatureFlags {
  community_enabled: boolean;
  ads_enabled: boolean;
  write_actions_enabled: boolean;
}

export interface AdminFeatureFlag {
  key: FeatureFlagKey;
  enabled: boolean;
  updated_at: string;
}
