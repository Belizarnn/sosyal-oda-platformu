import cors from "cors";
import express from "express";
import helmet from "helmet";
import { isOriginAllowed } from "./config/cors";
import { globalLimiter } from "./middleware/rateLimit.middleware";
import { requestLogMiddleware } from "./middleware/requestLog.middleware";
import { errorMiddleware } from "./middleware/error.middleware";
import { handleStripeWebhook } from "./modules/payments/payment.controller";
import { paymentRouter } from "./modules/payments/payment.routes";
import { authRouter } from "./modules/auth/auth.routes";
import { roomRouter } from "./modules/rooms/room.routes";
import { userRouter } from "./modules/users/user.routes";
import { voiceRouter } from "./modules/voice/voice.routes";
import { discoverRouter } from "./modules/discover/discover.routes";
import { reportsRouter } from "./modules/moderation/moderation.routes";
import { invitePreviewRouter } from "./modules/invites/invite.routes";
import { friendRouter } from "./modules/friends/friend.routes";
import { dmRouter } from "./modules/dm/dm.routes";
import { notificationRouter } from "./modules/notifications/notification.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import { analyticsRouter } from "./modules/analytics/analytics.routes";
import { feedbackRouter } from "./modules/feedback/feedback.routes";
import { publicRouter } from "./modules/public/public.routes";
import { communityInviteRouter, communityRouter } from "./modules/communities/community.routes";
import { dashboardRouter } from "./modules/dashboard/dashboard.routes";
import { premiumRouter } from "./modules/premium/premium.routes";
import { healthRouter } from "./routes/health";
import { asyncHandler } from "./utils/asyncHandler";

export const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

app.use(
  cors({
    origin(origin, callback) {
      callback(null, isOriginAllowed(origin));
    },
    credentials: true,
  }),
);

app.post(
  "/payments/webhook",
  express.raw({ type: "application/json" }),
  asyncHandler(handleStripeWebhook),
);

app.use(express.json({ limit: "1mb" }));
app.use(requestLogMiddleware);
app.use(globalLimiter);

app.use("/health", healthRouter);
app.use("/public", publicRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/rooms", roomRouter);
app.use("/communities", communityRouter);
app.use("/community-invites", communityInviteRouter);
app.use("/discover", discoverRouter);
app.use("/invites", invitePreviewRouter);
app.use("/friends", friendRouter);
app.use("/dm", dmRouter);
app.use("/notifications", notificationRouter);
app.use("/dashboard", dashboardRouter);
app.use("/premium", premiumRouter);
app.use("/payments", paymentRouter);
app.use("/analytics", analyticsRouter);
app.use("/feedback", feedbackRouter);
app.use("/admin", adminRouter);
app.use("/reports", reportsRouter);
app.use("/voice", voiceRouter);

app.use(errorMiddleware);
