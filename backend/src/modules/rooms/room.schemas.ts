import { RoomCategory, RoomType } from "@prisma/client";
import { z } from "zod";

export const createRoomSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(3, "Oda adı en az 3 karakter olmalı")
      .max(60, "Oda adı en fazla 60 karakter olabilir"),
    description: z
      .string()
      .trim()
      .max(240, "Açıklama en fazla 240 karakter olabilir")
      .optional()
      .nullable()
      .transform((value) => {
        if (value === undefined || value === null) {
          return null;
        }

        return value.length > 0 ? value : null;
      }),
    category: z.nativeEnum(RoomCategory, {
      message: "Geçersiz kategori",
    }),
    type: z.nativeEnum(RoomType, {
      message: "Geçersiz oda tipi",
    }),
    maxUserCount: z.coerce
      .number()
      .int()
      .min(2, "Minimum 2 kişi olmalı")
      .max(100, "Maksimum 100 kişi olabilir")
      .default(20),
    password: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.type === RoomType.PASSWORD_PROTECTED) {
      if (!data.password || data.password.length < 4) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Şifreli odalar için en az 4 karakterlik şifre gerekli",
          path: ["password"],
        });
      }
    }
  });

export const listRoomsQuerySchema = z.object({
  category: z.nativeEnum(RoomCategory).optional(),
  search: z.string().trim().optional(),
  type: z.nativeEnum(RoomType).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().min(1).optional(),
});

export const joinRoomSchema = z.object({
  password: z.string().optional(),
  inviteCode: z.string().trim().optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type ListRoomsQuery = z.infer<typeof listRoomsQuerySchema>;
export type JoinRoomInput = z.infer<typeof joinRoomSchema>;
