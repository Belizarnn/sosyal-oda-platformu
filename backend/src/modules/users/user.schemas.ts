import { PresenceStatus } from "@prisma/client";
import { z } from "zod";

export const updatePresenceSchema = z.object({
  presenceStatus: z.nativeEnum(PresenceStatus, {
    message: "Geçersiz presence durumu",
  }),
  statusMessage: z
    .string()
    .max(80, "Durum mesajı en fazla 80 karakter olabilir")
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      const trimmed = value?.trim() ?? "";
      return trimmed.length > 0 ? trimmed : null;
    }),
});

const optionalUrlSchema = z
  .string()
  .optional()
  .nullable()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const updateProfileSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Kullanıcı adı boş olamaz")
    .max(40, "Kullanıcı adı en fazla 40 karakter olabilir")
    .optional(),
  avatarUrl: optionalUrlSchema,
  bannerUrl: optionalUrlSchema,
  bio: z
    .string()
    .max(240, "Bio en fazla 240 karakter olabilir")
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      const trimmed = value?.trim() ?? "";
      return trimmed.length > 0 ? trimmed : null;
    }),
  statusMessage: z
    .string()
    .max(80, "Durum mesajı en fazla 80 karakter olabilir")
    .optional()
    .nullable()
    .transform((value) => {
      if (value === undefined) {
        return undefined;
      }

      const trimmed = value?.trim() ?? "";
      return trimmed.length > 0 ? trimmed : null;
    }),
  profileInterests: z
    .array(
      z
        .string()
        .trim()
        .min(1, "İlgi alanı boş olamaz")
        .max(24, "Her ilgi alanı en fazla 24 karakter olabilir"),
    )
    .max(12, "En fazla 12 ilgi alanı ekleyebilirsin")
    .optional(),
});

const nonWhitespacePassword = z
  .string()
  .refine((value) => value.trim().length > 0, "Şifre boş olamaz");

export const changePasswordSchema = z.object({
  currentPassword: nonWhitespacePassword,
  newPassword: nonWhitespacePassword.refine(
    (value) => value.length >= 6,
    "Yeni şifre en az 6 karakter olmalı",
  ),
});

export const updatePreferencesSchema = z.object({
  notifyFriendRequests: z.boolean().optional(),
  notifyFriendAccepted: z.boolean().optional(),
  notifyDmMessages: z.boolean().optional(),
  notifyRoomModeration: z.boolean().optional(),
  notifyRoomActivity: z.boolean().optional(),
  notifySystem: z.boolean().optional(),
});

export const handleParamSchema = z.object({
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Handle gerekli")
    .regex(/^[a-z0-9_]+$/, "Geçersiz handle"),
});

export type UpdatePresenceInput = z.infer<typeof updatePresenceSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
