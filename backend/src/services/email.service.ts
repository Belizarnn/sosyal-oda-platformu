import { Resend } from "resend";
import { env } from "../config/env";

type EmailUser = {
  email: string;
  username: string;
};

function canSendEmail(): boolean {
  return env.emailProvider === "resend" && Boolean(env.resendApiKey);
}

function getResendClient(): Resend | null {
  if (!canSendEmail()) {
    return null;
  }

  return new Resend(env.resendApiKey);
}

export async function sendVerificationEmail(
  user: EmailUser,
  verificationUrl: string,
): Promise<void> {
  if (!canSendEmail()) {
    if (env.isDevelopment) {
      console.log(`[email] Doğrulama bağlantısı (${user.email}): ${verificationUrl}`);
    }
    return;
  }

  const resend = getResendClient();

  if (!resend) {
    return;
  }

  await resend.emails.send({
    from: env.emailFrom,
    to: user.email,
    subject: "E-posta adresini doğrula — Sosyal Oda",
    html: `
      <p>Merhaba ${user.username},</p>
      <p>Sosyal Oda hesabını aktifleştirmek için aşağıdaki bağlantıya tıkla:</p>
      <p><a href="${verificationUrl}">E-postamı doğrula</a></p>
      <p>Bu bağlantı sınırlı süre geçerlidir. Hesabı sen oluşturmadıysan bu e-postayı yok say.</p>
    `,
  });
}

export async function sendPasswordResetEmail(
  user: EmailUser,
  resetUrl: string,
): Promise<void> {
  if (!canSendEmail()) {
    if (env.isDevelopment) {
      console.log(`[email] Şifre sıfırlama bağlantısı (${user.email}): ${resetUrl}`);
    }
    return;
  }

  const resend = getResendClient();

  if (!resend) {
    return;
  }

  await resend.emails.send({
    from: env.emailFrom,
    to: user.email,
    subject: "Şifre sıfırlama — Sosyal Oda",
    html: `
      <p>Merhaba ${user.username},</p>
      <p>Şifreni sıfırlamak için aşağıdaki bağlantıya tıkla:</p>
      <p><a href="${resetUrl}">Şifremi sıfırla</a></p>
      <p>Bu bağlantı kısa süre geçerlidir. İsteği sen yapmadıysan bu e-postayı yok say.</p>
    `,
  });
}

export function buildVerificationUrl(rawToken: string): string {
  return `${env.appUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;
}

export function buildPasswordResetUrl(rawToken: string): string {
  return `${env.appUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;
}
