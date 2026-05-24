import type { User } from "@prisma/client";
import { AppError } from "./asyncHandler";
import type { PremiumFeatureName } from "../constants/premiumPlans";

type PremiumUserFields = Pick<User, "isPremium" | "premiumExpiresAt">;

export function isUserPremium(user: PremiumUserFields): boolean {
  if (!user.isPremium) {
    return false;
  }

  if (!user.premiumExpiresAt) {
    return true;
  }

  return user.premiumExpiresAt.getTime() > Date.now();
}

export function getPremiumFeatures(active: boolean) {
  return {
    animatedAvatar: active,
    profileFrame: active,
    roomThemes: active,
    premiumBadge: active,
  };
}

export function getPremiumStatus(user: User) {
  const active = isUserPremium(user);

  return {
    isPremium: active,
    plan: active ? user.premiumPlan : null,
    premiumStartedAt:
      active && user.premiumStartedAt
        ? user.premiumStartedAt.toISOString()
        : null,
    premiumExpiresAt:
      active && user.premiumExpiresAt
        ? user.premiumExpiresAt.toISOString()
        : null,
    features: getPremiumFeatures(active),
  };
}

export function requirePremiumFeature(
  user: PremiumUserFields,
  _featureName: PremiumFeatureName,
): void {
  if (!isUserPremium(user)) {
    throw new AppError(403, "Bu özellik Premium kullanıcılar içindir.");
  }
}

export function getPublicPremiumProfileFields(user: User) {
  const active = isUserPremium(user);

  if (!active) {
    return {
      isPremium: false,
      premiumBadgeVisible: false,
      premiumProfileFrame: null,
      premiumAvatarEffect: null,
    };
  }

  return {
    isPremium: true,
    premiumBadgeVisible: user.premiumBadgeVisible,
    premiumProfileFrame: user.premiumProfileFrame,
    premiumAvatarEffect: user.premiumAvatarEffect,
  };
}
