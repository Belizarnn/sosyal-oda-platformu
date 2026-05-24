import { z } from "zod";
import {
  PREMIUM_AVATAR_EFFECTS,
  PREMIUM_PROFILE_FRAMES,
} from "../../constants/premiumPlans";

export const updatePremiumPreferencesSchema = z.object({
  premiumBadgeVisible: z.boolean().optional(),
  premiumProfileFrame: z.enum(PREMIUM_PROFILE_FRAMES).nullable().optional(),
  premiumAvatarEffect: z.enum(PREMIUM_AVATAR_EFFECTS).nullable().optional(),
});

export type UpdatePremiumPreferencesInput = z.infer<
  typeof updatePremiumPreferencesSchema
>;
