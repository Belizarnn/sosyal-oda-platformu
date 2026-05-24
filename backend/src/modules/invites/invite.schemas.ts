import { z } from "zod";

export const updateInviteSettingsSchema = z.object({
  inviteEnabled: z.boolean(),
});

export type UpdateInviteSettingsInput = z.infer<typeof updateInviteSettingsSchema>;
