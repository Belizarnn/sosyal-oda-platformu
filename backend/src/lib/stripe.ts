import Stripe from "stripe";
import { env } from "../config/env";
import { AppError } from "../utils/asyncHandler";

let stripeClient: InstanceType<typeof Stripe> | null = null;

export function isStripeConfigured(): boolean {
  return Boolean(env.stripeSecretKey);
}

export function getStripe(): InstanceType<typeof Stripe> {
  if (!env.stripeSecretKey) {
    throw new AppError(
      503,
      "Stripe yapılandırılmamış. STRIPE_SECRET_KEY tanımlayın.",
    );
  }

  if (!stripeClient) {
    stripeClient = new Stripe(env.stripeSecretKey);
  }

  return stripeClient;
}

export function getStripePriceIdForCheckoutPlan(
  plan: "MONTHLY" | "YEARLY",
): string {
  const priceId =
    plan === "MONTHLY"
      ? env.stripePremiumMonthlyPriceId
      : env.stripePremiumYearlyPriceId;

  if (!priceId) {
    throw new AppError(
      503,
      "Stripe price ID yapılandırılmamış. İlgili STRIPE_PREMIUM_*_PRICE_ID değerini ekleyin.",
    );
  }

  return priceId;
}

export function resolvePremiumPlanFromPriceId(
  priceId: string | null | undefined,
): string | null {
  if (!priceId) {
    return null;
  }

  if (priceId === env.stripePremiumMonthlyPriceId) {
    return "PREMIUM_MONTHLY";
  }

  if (priceId === env.stripePremiumYearlyPriceId) {
    return "PREMIUM_YEARLY";
  }

  return null;
}

export const ACTIVE_SUBSCRIPTION_STATUSES = new Set(["active", "trialing"]);

export const INACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "canceled",
  "unpaid",
  "incomplete_expired",
]);

export function isActiveSubscriptionStatus(status: string): boolean {
  return ACTIVE_SUBSCRIPTION_STATUSES.has(status);
}
