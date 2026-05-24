import bcrypt from "bcrypt";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { trackServerEvent } from "../../lib/analytics";
import {
  assertBetaCodeProvided,
  redeemBetaAccessCode,
} from "../beta/beta.service";
import { signToken } from "../../lib/jwt";
import { AppError } from "../../utils/asyncHandler";
import { trimAndLimit } from "../../utils/sanitizeInput";
import { sanitizeUser } from "../../utils/sanitizeUser";
import { generateRawToken, hashToken, verifyTokenHash } from "../../utils/token";
import {
  buildPasswordResetUrl,
  buildVerificationUrl,
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../../services/email.service";
import type {
  ForgotPasswordInput,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  VerifyEmailInput,
} from "./auth.schemas";

const BCRYPT_ROUNDS = 12;
const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;

const FORGOT_PASSWORD_MESSAGE =
  "Eğer bu e-posta kayıtlıysa şifre sıfırlama bağlantısı gönderildi.";

async function createVerificationToken(userId: string): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
      usedAt: null,
    },
  });

  const rawToken = generateRawToken();

  await prisma.emailVerificationToken.create({
    data: {
      userId,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
    },
  });

  return rawToken;
}

async function deliverVerificationEmail(
  user: { email: string; username: string },
  rawToken: string,
): Promise<void> {
  await sendVerificationEmail(
    user,
    buildVerificationUrl(rawToken),
  );
}

export async function registerUser(input: RegisterInput) {
  const existingEmail = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (existingEmail) {
    throw new AppError(409, "Bu e-posta adresi zaten kullanılıyor");
  }

  const existingHandle = await prisma.user.findUnique({
    where: { handle: input.handle },
  });

  if (existingHandle) {
    throw new AppError(409, "Bu handle zaten kullanılıyor");
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const username = trimAndLimit(input.username, 40);

  if (!username) {
    throw new AppError(400, "Kullanıcı adı boş olamaz");
  }

  assertBetaCodeProvided(input.betaCode);

  const user = await prisma.$transaction(async (tx) => {
    let redeemedCodeId: string | null = null;

    if (env.betaAccessRequired) {
      redeemedCodeId = await redeemBetaAccessCode(tx, input.betaCode!);
    }

    const createdUser = await tx.user.create({
      data: {
        username,
        handle: input.handle,
        email: input.email,
        passwordHash,
        emailVerified: false,
      },
    });

    if (redeemedCodeId) {
      await tx.betaAccessRedemption.create({
        data: {
          codeId: redeemedCodeId,
          userId: createdUser.id,
        },
      });
    }

    return createdUser;
  });

  const verificationToken = await createVerificationToken(user.id);
  await deliverVerificationEmail(user, verificationToken);

  const token = signToken(user.id);

  void trackServerEvent({
    eventName: "user_registered",
    userId: user.id,
    properties: { handle: user.handle },
  });

  return {
    message: "Hesabın oluşturuldu. Lütfen e-posta adresini doğrula.",
    token,
    user: sanitizeUser(user),
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new AppError(401, "E-posta veya şifre hatalı");
  }

  const passwordValid = await bcrypt.compare(input.password, user.passwordHash);

  if (!passwordValid) {
    throw new AppError(401, "E-posta veya şifre hatalı");
  }

  const token = signToken(user.id);

  void trackServerEvent({
    eventName: "user_logged_in",
    userId: user.id,
  });

  return {
    token,
    user: sanitizeUser(user),
  };
}

export async function resendVerificationEmail(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  if (user.emailVerified) {
    throw new AppError(400, "E-posta zaten doğrulanmış.");
  }

  const rawToken = await createVerificationToken(user.id);
  await deliverVerificationEmail(user, rawToken);

  return {
    message: "Doğrulama e-postası tekrar gönderildi.",
  };
}

export async function verifyEmail(input: VerifyEmailInput) {
  const tokenHash = hashToken(input.token);

  const verificationToken = await prisma.emailVerificationToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
    },
    include: {
      user: true,
    },
  });

  if (
    !verificationToken ||
    !verifyTokenHash(input.token, verificationToken.tokenHash)
  ) {
    throw new AppError(400, "Doğrulama bağlantısı geçersiz veya süresi dolmuş.");
  }

  if (verificationToken.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, "Doğrulama bağlantısı geçersiz veya süresi dolmuş.");
  }

  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        emailVerified: true,
        emailVerifiedAt: now,
      },
    }),
    prisma.emailVerificationToken.update({
      where: { id: verificationToken.id },
      data: { usedAt: now },
    }),
  ]);

  return {
    message: "E-posta başarıyla doğrulandı.",
  };
}

export async function forgotPassword(input: ForgotPasswordInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (user) {
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    const rawToken = generateRawToken();

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawToken),
        expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    await sendPasswordResetEmail(
      { email: user.email, username: user.username },
      buildPasswordResetUrl(rawToken),
    );
  }

  return {
    message: FORGOT_PASSWORD_MESSAGE,
  };
}

export async function resetPassword(input: ResetPasswordInput) {
  const tokenHash = hashToken(input.token);

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      tokenHash,
      usedAt: null,
    },
    include: {
      user: true,
    },
  });

  if (!resetToken || !verifyTokenHash(input.token, resetToken.tokenHash)) {
    throw new AppError(400, "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.");
  }

  if (resetToken.expiresAt.getTime() < Date.now()) {
    throw new AppError(400, "Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, BCRYPT_ROUNDS);
  const now = new Date();

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: now },
    }),
  ]);

  return {
    message: "Şifren başarıyla güncellendi.",
  };
}
