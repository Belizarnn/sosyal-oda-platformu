import { RoomCategory, RoomType } from "@prisma/client";
import { z } from "zod";

export const discoverSortValues = [
  "trending",
  "newest",
  "active",
  "recommended",
] as const;

export const discoverRoomsQuerySchema = z.object({
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
  category: z.nativeEnum(RoomCategory, {
    message: "Geçersiz kategori",
  }).optional(),
  sort: z.enum(discoverSortValues, {
    message: "Geçersiz sıralama",
  }).default("trending"),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.nativeEnum(RoomType, {
    message: "Geçersiz oda tipi",
  }).optional(),
  cursor: z.string().min(1).optional(),
});

export type DiscoverRoomsQuery = z.infer<typeof discoverRoomsQuerySchema>;
