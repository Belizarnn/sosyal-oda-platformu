import { z } from "zod";

const handleSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^@/, "").toLowerCase())
  .pipe(
    z
      .string()
      .min(1, "Handle boş olamaz")
      .regex(/^[a-z0-9_]+$/, "Geçerli bir handle girin"),
  );

export const sendFriendRequestSchema = z.object({
  receiverHandle: handleSchema,
});

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>;
