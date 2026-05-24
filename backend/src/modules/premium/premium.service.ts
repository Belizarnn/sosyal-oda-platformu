import { prisma } from "../../lib/prisma";
import {
  formatSubscriptionResponse,
  getLatestSubscriptionForUser,
} from "../payments/payment.service";
import { AppError } from "../../utils/asyncHandler";
import {
  getPremiumStatus,
  isUserPremium,
  requirePremiumFeature,
} from "../../utils/premium";
import { sanitizeUser } from "../../utils/sanitizeUser";
import type { UpdatePremiumPreferencesInput } from "./premium.schemas";

export async function getPremiumStatusForUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  const subscription = await getLatestSubscriptionForUser(userId);

  return {
    ...getPremiumStatus(user),
    subscription: formatSubscriptionResponse(subscription),
  };
}

export async function updatePremiumPreferences(
  userId: string,
  input: UpdatePremiumPreferencesInput,
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  requirePremiumFeature(user, "profileFrame");

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...(input.premiumBadgeVisible !== undefined
        ? { premiumBadgeVisible: input.premiumBadgeVisible }
        : {}),
      ...(input.premiumProfileFrame !== undefined
        ? { premiumProfileFrame: input.premiumProfileFrame }
        : {}),
      ...(input.premiumAvatarEffect !== undefined
        ? { premiumAvatarEffect: input.premiumAvatarEffect }
        : {}),
    },
  });

  if (!isUserPremium(updatedUser)) {
    throw new AppError(403, "Bu özellik Premium kullanıcılar içindir.");
  }

  return {
    user: sanitizeUser(updatedUser),
    status: {
      ...getPremiumStatus(updatedUser),
      subscription: formatSubscriptionResponse(
        await getLatestSubscriptionForUser(userId),
      ),
    },
  };
}
