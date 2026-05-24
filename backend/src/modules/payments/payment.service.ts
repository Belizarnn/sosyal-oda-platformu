import type { Subscription } from "@prisma/client";
import Stripe from "stripe";
import { env } from "../../config/env";
import { prisma } from "../../lib/prisma";
import { trackServerEvent } from "../../lib/analytics";
import {
  getStripe,
  getStripePriceIdForCheckoutPlan,
  isActiveSubscriptionStatus,
  isStripeConfigured,
  resolvePremiumPlanFromPriceId,
} from "../../lib/stripe";
import { AppError } from "../../utils/asyncHandler";
import type { CreateCheckoutSessionInput } from "./payment.schemas";

type StripeClient = InstanceType<typeof Stripe>;
type StripeSubscription = Awaited<
  ReturnType<StripeClient["subscriptions"]["retrieve"]>
>;
type StripeInvoice = Awaited<ReturnType<StripeClient["invoices"]["retrieve"]>>;
type StripeCheckoutSession = Awaited<
  ReturnType<StripeClient["checkout"]["sessions"]["retrieve"]>
>;

function formatSubscriptionResponse(subscription: Subscription | null) {
  if (!subscription) {
    return null;
  }

  return {
    status: subscription.status,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
    currentPeriodStart: subscription.currentPeriodStart?.toISOString() ?? null,
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    stripePriceId: subscription.stripePriceId,
    provider: subscription.provider,
  };
}

async function findUserByStripeCustomerId(customerId: string) {
  return prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
  });
}

async function ensureStripeCustomer(user: {
  id: string;
  email: string;
  username: string;
  stripeCustomerId: string | null;
}): Promise<string> {
  if (user.stripeCustomerId) {
    return user.stripeCustomerId;
  }

  const stripe = getStripe();
  const customer = await stripe.customers.create({
    email: user.email,
    name: user.username,
    metadata: {
      userId: user.id,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { stripeCustomerId: customer.id },
  });

  return customer.id;
}

function getSubscriptionPeriodDates(subscription: StripeSubscription) {
  const item = subscription.items.data[0];

  return {
    currentPeriodStart: item?.current_period_start
      ? new Date(item.current_period_start * 1000)
      : null,
    currentPeriodEnd: item?.current_period_end
      ? new Date(item.current_period_end * 1000)
      : null,
  };
}

export async function syncSubscriptionForUser(
  userId: string,
  stripeSubscription: StripeSubscription,
) {
  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;
  const priceId = stripeSubscription.items.data[0]?.price.id ?? null;
  const { currentPeriodStart, currentPeriodEnd } =
    getSubscriptionPeriodDates(stripeSubscription);
  const isActive = isActiveSubscriptionStatus(stripeSubscription.status);
  const premiumPlan = isActive
    ? resolvePremiumPlanFromPriceId(priceId)
    : null;

  await prisma.subscription.upsert({
    where: { stripeSubscriptionId: stripeSubscription.id },
    create: {
      userId,
      provider: "stripe",
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubscription.id,
      stripePriceId: priceId,
      status: stripeSubscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    },
    update: {
      stripeCustomerId: customerId,
      stripePriceId: priceId,
      status: stripeSubscription.status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
    },
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      isPremium: isActive,
      premiumStartedAt: isActive ? currentPeriodStart : null,
      premiumExpiresAt: currentPeriodEnd,
      premiumPlan: isActive ? premiumPlan : null,
    },
  });
}

async function resolveUserIdFromSubscription(
  stripeSubscription: StripeSubscription,
): Promise<string | null> {
  const metadataUserId = stripeSubscription.metadata?.userId;

  if (metadataUserId) {
    return metadataUserId;
  }

  const customerId =
    typeof stripeSubscription.customer === "string"
      ? stripeSubscription.customer
      : stripeSubscription.customer.id;

  const user = await findUserByStripeCustomerId(customerId);
  return user?.id ?? null;
}

function getInvoiceSubscriptionId(invoice: StripeInvoice): string | null {
  const subscriptionRef =
    invoice.parent?.subscription_details?.subscription ?? null;

  if (typeof subscriptionRef === "string") {
    return subscriptionRef;
  }

  if (subscriptionRef && typeof subscriptionRef === "object") {
    return subscriptionRef.id;
  }

  return null;
}

export async function createCheckoutSession(
  userId: string,
  input: CreateCheckoutSessionInput,
) {
  if (!isStripeConfigured()) {
    throw new AppError(503, "Stripe test modu yapılandırılmamış.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  const stripe = getStripe();
  const customerId = await ensureStripeCustomer(user);
  const priceId = getStripePriceIdForCheckoutPlan(input.plan);
  const clientUrl = env.clientUrl.replace(/\/$/, "");

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${clientUrl}/premium/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${clientUrl}/premium/cancel`,
    metadata: {
      userId: user.id,
      plan: input.plan,
    },
    subscription_data: {
      metadata: {
        userId: user.id,
        plan: input.plan,
      },
    },
  });

  if (!session.url) {
    throw new AppError(500, "Checkout oturumu oluşturulamadı");
  }

  void trackServerEvent({
    eventName: "premium_checkout_started",
    userId,
    properties: { plan: input.plan },
  });

  return {
    checkoutUrl: session.url,
  };
}

export async function createCustomerPortalSession(userId: string) {
  if (!isStripeConfigured()) {
    throw new AppError(503, "Stripe test modu yapılandırılmamış.");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(404, "Kullanıcı bulunamadı");
  }

  if (!user.stripeCustomerId) {
    throw new AppError(400, "Stripe müşteri kaydı bulunamadı.");
  }

  const stripe = getStripe();
  const clientUrl = env.clientUrl.replace(/\/$/, "");

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${clientUrl}/settings`,
  });

  return {
    portalUrl: session.url,
  };
}

async function handleCheckoutSessionCompleted(
  session: StripeCheckoutSession,
) {
  const userId = session.metadata?.userId ?? session.client_reference_id;

  if (!userId || !session.subscription) {
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(
    String(session.subscription),
  );

  await syncSubscriptionForUser(userId, subscription);
}

async function handleSubscriptionEvent(subscription: StripeSubscription) {
  const userId = await resolveUserIdFromSubscription(subscription);

  if (!userId) {
    return;
  }

  await syncSubscriptionForUser(userId, subscription);
}

async function handleInvoiceEvent(invoice: StripeInvoice) {
  const subscriptionId = getInvoiceSubscriptionId(invoice);

  if (!subscriptionId) {
    return;
  }

  const stripe = getStripe();
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  await handleSubscriptionEvent(subscription);
}

export async function processStripeWebhook(
  rawBody: Buffer,
  signature: string | undefined,
) {
  if (!env.stripeWebhookSecret) {
    throw new AppError(503, "STRIPE_WEBHOOK_SECRET tanımlı değil.");
  }

  if (!signature) {
    throw new AppError(400, "Stripe imzası eksik.");
  }

  const stripe = getStripe();
  const event = stripe.webhooks.constructEvent(
    rawBody,
    signature,
    env.stripeWebhookSecret,
  );

  const existing = await prisma.paymentEvent.findUnique({
    where: { eventId: event.id },
  });

  if (existing?.processedAt) {
    return { received: true, duplicate: true };
  }

  await prisma.paymentEvent.upsert({
    where: { eventId: event.id },
    create: {
      provider: "stripe",
      eventId: event.id,
      eventType: event.type,
      payload: JSON.parse(JSON.stringify(event)),
    },
    update: {},
  });

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutSessionCompleted(
        event.data.object as StripeCheckoutSession,
      );
      break;
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionEvent(event.data.object as StripeSubscription);
      break;
    case "invoice.payment_succeeded":
    case "invoice.payment_failed":
      await handleInvoiceEvent(event.data.object as StripeInvoice);
      break;
    default:
      break;
  }

  await prisma.paymentEvent.update({
    where: { eventId: event.id },
    data: { processedAt: new Date() },
  });

  return { received: true, duplicate: false };
}

export async function getLatestSubscriptionForUser(userId: string) {
  return prisma.subscription.findFirst({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}

export { formatSubscriptionResponse };
