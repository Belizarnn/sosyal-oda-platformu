export type PremiumCheckoutPlan = "MONTHLY" | "YEARLY";

export type PremiumPlanId = "FREE" | "PREMIUM_MONTHLY" | "PREMIUM_YEARLY";

export type PremiumProfileFrame = "violet-glow" | "indigo-ring" | "cosmic-haze";

export type PremiumAvatarEffect = "soft-pulse" | "shimmer" | "orbit";

export interface PremiumFeatures {
  animatedAvatar: boolean;
  profileFrame: boolean;
  roomThemes: boolean;
  premiumBadge: boolean;
}

export interface PremiumSubscriptionInfo {
  status: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  stripePriceId: string | null;
  provider: string;
}

export interface PremiumStatusResponse {
  isPremium: boolean;
  plan: string | null;
  premiumStartedAt: string | null;
  premiumExpiresAt: string | null;
  features: PremiumFeatures;
  subscription: PremiumSubscriptionInfo | null;
}

export interface UpdatePremiumPreferencesInput {
  premiumBadgeVisible?: boolean;
  premiumProfileFrame?: PremiumProfileFrame | null;
  premiumAvatarEffect?: PremiumAvatarEffect | null;
}

export interface PremiumPreferencesResponse {
  user: {
    id: string;
    premiumBadgeVisible: boolean;
    premiumProfileFrame: string | null;
    premiumAvatarEffect: string | null;
    isPremium: boolean;
  };
  status: PremiumStatusResponse;
}

export const PREMIUM_PROFILE_FRAMES: PremiumProfileFrame[] = [
  "violet-glow",
  "indigo-ring",
  "cosmic-haze",
];

export const PREMIUM_AVATAR_EFFECTS: PremiumAvatarEffect[] = [
  "soft-pulse",
  "shimmer",
  "orbit",
];

export const PREMIUM_FEATURE_ITEMS = [
  "badge",
  "frame",
  "avatarEffect",
  "roomThemes",
  "profile",
  "supporter",
] as const;
