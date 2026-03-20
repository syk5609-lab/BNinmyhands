// Feature flags for launch scope gating
// In production these would come from a remote config service

export interface FeatureFlags {
  communityEnabled: boolean;
  discussionEnabled: boolean;
  sponsoredAdsEnabled: boolean;
  adminConsoleEnabled: boolean;
  signupEnabled: boolean;
}

// Default launch flags
const flags: FeatureFlags = {
  communityEnabled: true,
  discussionEnabled: true,
  sponsoredAdsEnabled: true,
  adminConsoleEnabled: true,
  signupEnabled: true,
};

export function getFeatureFlags(): FeatureFlags {
  return { ...flags };
}

export function isFeatureEnabled(key: keyof FeatureFlags): boolean {
  return flags[key];
}
