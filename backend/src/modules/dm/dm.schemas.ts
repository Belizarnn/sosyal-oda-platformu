import { z } from "zod";

const handleSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@/, "").toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Handle boş olamaz")
      .regex(/^[a-z0-9_]+$/, "Geçerli bir handle girin"),
  );

export const startDirectConversationSchema = z
  .object({
    userId: z.string().trim().min(1).optional(),
    handle: handleSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.userId && !data.handle) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "userId veya handle gerekli",
        path: ["userId"],
      });
    }
  });

export const sendDmMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Mesaj boş olamaz")
    .max(1000, "Mesaj en fazla 1000 karakter olabilir"),
});

export const listDmMessagesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  before: z.string().min(1).optional(),
});

export const dmConversationPayloadSchema = z.object({
  conversationId: z.string().trim().min(1, "conversationId gerekli"),
});

export const dmMessageSendPayloadSchema = z.object({
  conversationId: z.string().trim().min(1, "conversationId gerekli"),
  content: z
    .string()
    .trim()
    .min(1, "Mesaj boş olamaz")
    .max(1000, "Mesaj en fazla 1000 karakter olabilir"),
});

export type StartDirectConversationInput = z.infer<
  typeof startDirectConversationSchema
>;
export type SendDmMessageInput = z.infer<typeof sendDmMessageSchema>;
export type ListDmMessagesQuery = z.infer<typeof listDmMessagesQuerySchema>;
