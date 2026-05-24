import { z } from "zod";

const mediaProviderEnum = z.enum([
  "YOUTUBE",
  "TWITCH",
  "KICK",
  "NETFLIX",
  "DISNEY_PLUS",
  "PRIME_VIDEO",
]);

const assistedExternalFields = {
  externalTitle: z.string().optional(),
  externalUrl: z.string().optional(),
  externalSeason: z.number().int().min(0).max(999).optional(),
  externalEpisode: z.number().int().min(0).max(999).optional(),
  externalStartOffsetMinutes: z.number().min(0).max(24 * 60).optional(),
  externalNotes: z.string().max(500).optional(),
};

export const setWatchVideoSchema = z.object({
  videoUrl: z.string().min(1, "videoUrl zorunlu"),
});

export const setWatchMediaSchema = z
  .object({
    provider: mediaProviderEnum,
    url: z.string().optional(),
    ...assistedExternalFields,
  })
  .superRefine((data, ctx) => {
    const embedProviders = ["YOUTUBE", "TWITCH", "KICK"] as const;
    const assistedProviders = ["NETFLIX", "DISNEY_PLUS", "PRIME_VIDEO"] as const;

    if (embedProviders.includes(data.provider as (typeof embedProviders)[number])) {
      if (!data.url?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "URL zorunlu",
          path: ["url"],
        });
      }
    }

    if (
      assistedProviders.includes(data.provider as (typeof assistedProviders)[number])
    ) {
      if (!data.externalTitle?.trim()) {
        ctx.addIssue({
          code: "custom",
          message: "İçerik adı zorunlu",
          path: ["externalTitle"],
        });
      }
    }
  });

export const addToWatchQueueSchema = setWatchVideoSchema;

export const watchControlSchema = z.object({
  action: z.enum(["PLAY", "PAUSE", "SEEK"]),
  currentTime: z.number().min(0, "currentTime negatif olamaz"),
});

export const watchReadySchema = z.object({
  isReady: z.boolean(),
});

export const watchCountdownSchema = z.object({
  seconds: z.union([z.literal(3), z.literal(5), z.literal(10)]),
});

export const watchJoinPayloadSchema = z.object({
  roomId: z.string().min(1),
});

export const watchSetVideoPayloadSchema = setWatchVideoSchema.extend({
  roomId: z.string().min(1),
});

export const watchSetMediaPayloadSchema = setWatchMediaSchema.extend({
  roomId: z.string().min(1),
});

export const watchReadyPayloadSchema = watchReadySchema.extend({
  roomId: z.string().min(1),
});

export const watchCountdownPayloadSchema = watchCountdownSchema.extend({
  roomId: z.string().min(1),
});

export const watchPlayPayloadSchema = z.object({
  roomId: z.string().min(1),
  currentTime: z.number().min(0),
});

export const watchPausePayloadSchema = watchPlayPayloadSchema;
export const watchSeekPayloadSchema = watchPlayPayloadSchema;

export const watchTimerSyncPayloadSchema = z.object({
  roomId: z.string().min(1),
  currentTime: z.number().min(0),
  isPlaying: z.boolean(),
});

export type SetWatchVideoInput = z.infer<typeof setWatchVideoSchema>;
export type SetWatchMediaInput = z.infer<typeof setWatchMediaSchema>;
export type WatchControlInput = z.infer<typeof watchControlSchema>;
export type WatchReadyInput = z.infer<typeof watchReadySchema>;
export type WatchCountdownInput = z.infer<typeof watchCountdownSchema>;
