import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  plan: z.enum(["MONTHLY", "YEARLY"], {
    message: "Geçerli bir plan seçin (MONTHLY veya YEARLY)",
  }),
});

export type CreateCheckoutSessionInput = z.infer<
  typeof createCheckoutSessionSchema
>;
