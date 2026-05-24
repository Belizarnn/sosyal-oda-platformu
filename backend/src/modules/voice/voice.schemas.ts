import { z } from "zod";

export const voiceTokenBodySchema = z.object({
  roomId: z.string().min(1, "roomId zorunlu"),
});

export type VoiceTokenBody = z.infer<typeof voiceTokenBodySchema>;
