import { z } from "zod";



export const listMessagesQuerySchema = z.object({

  limit: z.coerce.number().int().min(1).max(100).default(50),

  before: z.string().min(1).optional(),

});



export const sendMessageSchema = z.object({

  roomId: z.string().min(1),

  content: z

    .string()

    .trim()

    .min(1, "Mesaj boş olamaz")

    .max(1000, "Mesaj en fazla 1000 karakter olabilir"),

  replyToMessageId: z.string().nullable().optional(),

});



export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;

export type SendMessageInput = z.infer<typeof sendMessageSchema>;



export const roomJoinPayloadSchema = z.object({

  roomId: z.string().min(1),

});



export const roomLeavePayloadSchema = z.object({

  roomId: z.string().min(1),

});



export const typingPayloadSchema = z.object({

  roomId: z.string().min(1),

});

