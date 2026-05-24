import { z } from "zod";

const handleSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Handle boş olamaz")
  .regex(/^[a-z0-9_]+$/, "Handle yalnızca küçük harf, rakam ve _ içerebilir");

export const registerSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Kullanıcı adı boş olamaz")
    .max(40, "Kullanıcı adı en fazla 40 karakter olabilir"),
  handle: handleSchema,
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta girin")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
  betaCode: z.string().trim().max(64).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta girin")
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Şifre boş olamaz"),
});

export const verifyEmailSchema = z.object({
  token: z.string().trim().min(1, "Doğrulama token'ı gerekli"),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Geçerli bir e-posta girin")
    .transform((value) => value.toLowerCase()),
});

export const resetPasswordSchema = z.object({
  token: z.string().trim().min(1, "Sıfırlama token'ı gerekli"),
  newPassword: z.string().min(8, "Yeni şifre en az 8 karakter olmalı"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
