import { env } from "../config/env";

/**
 * Captcha doğrulaması için placeholder.
 * CAPTCHA_PROVIDER ve CAPTCHA_SECRET tanımlı değilse doğrulama atlanır.
 */
export async function verifyCaptcha(_token?: string | null): Promise<boolean> {
  if (!env.captchaProvider || !env.captchaSecret) {
    return true;
  }

  // TODO (Production): CAPTCHA_PROVIDER (turnstile/hcaptcha/recaptcha) ile doğrula.
  return true;
}

export function isCaptchaConfigured(): boolean {
  return Boolean(env.captchaProvider && env.captchaSecret);
}
