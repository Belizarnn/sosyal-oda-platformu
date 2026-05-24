export const PREMIUM_PLANS = {
  FREE: "FREE",
  PREMIUM_MONTHLY: "PREMIUM_MONTHLY",
  PREMIUM_YEARLY: "PREMIUM_YEARLY",
} as const;

export type PremiumPlan = (typeof PREMIUM_PLANS)[keyof typeof PREMIUM_PLANS];

export const PREMIUM_PROFILE_FRAMES = [
  "violet-glow",
  "indigo-ring",
  "cosmic-haze",
] as const;

export type PremiumProfileFrame = (typeof PREMIUM_PROFILE_FRAMES)[number];

export const PREMIUM_AVATAR_EFFECTS = [
  "soft-pulse",
  "shimmer",
  "orbit",
] as const;

export type PremiumAvatarEffect = (typeof PREMIUM_AVATAR_EFFECTS)[number];

export type PremiumFeatureName =
  | "animatedAvatar"
  | "profileFrame"
  | "roomThemes"
  | "premiumBadge";

export const PREMIUM_FEATURES: PremiumFeatureName[] = [
  "animatedAvatar",
  "profileFrame",
  "roomThemes",
  "premiumBadge",
];
