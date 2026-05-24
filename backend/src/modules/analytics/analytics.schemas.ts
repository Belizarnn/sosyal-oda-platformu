import { z } from "zod";

const eventNameSchema = z
  .string()
  .trim()
  .min(1, "eventName zorunludur")
  .max(80, "eventName en fazla 80 karakter olabilir")
  .regex(
    /^[a-z0-9_]+$/,
    "eventName yalnızca küçük harf, rakam ve _ içerebilir",
  );

export const trackAnalyticsEventSchema = z.object({
  eventName: eventNameSchema,
  properties: z.record(z.string(), z.unknown()).optional(),
  sessionId: z.string().trim().max(64).optional().nullable(),
  path: z.string().trim().max(500).optional().nullable(),
});

export type TrackAnalyticsEventInput = z.infer<typeof trackAnalyticsEventSchema>;
