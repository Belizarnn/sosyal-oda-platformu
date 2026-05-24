import rateLimit from "express-rate-limit";

const RATE_LIMIT_MESSAGE =
  "Çok fazla deneme yaptın. Lütfen biraz sonra tekrar dene.";

function createLimiter(options: {
  windowMs: number;
  max: number;
  message?: string;
}) {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      message: options.message ?? RATE_LIMIT_MESSAGE,
      code: "RATE_LIMITED",
    },
  });
}

export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 1000,
});

export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
});

export const registerLimiter = createLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
});

export const messageLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 60,
  message: "Çok hızlı mesaj gönderiyorsun.",
});

export const reportLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 10,
});

export const inviteLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 50,
});

export const analyticsLimiter = createLimiter({
  windowMs: 60 * 1000,
  max: 120,
});

export const feedbackLimiter = createLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Çok fazla geri bildirim gönderdin. Lütfen biraz sonra tekrar dene.",
});

export { RATE_LIMIT_MESSAGE };
