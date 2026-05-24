import type { Request, Response } from "express";
import { ZodError } from "zod";
import { verifyToken } from "../../lib/jwt";
import { discoverRoomsQuerySchema } from "./discover.schemas";
import * as discoverService from "./discover.service";

function getOptionalUserId(req: Request): string | undefined {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return undefined;
  }

  try {
    const payload = verifyToken(authHeader.slice(7));
    return payload.userId;
  } catch {
    return undefined;
  }
}

export async function getDiscoverRooms(req: Request, res: Response) {
  try {
    const query = discoverRoomsQuerySchema.parse(req.query);
    const userId = getOptionalUserId(req);
    const result = await discoverService.discoverRooms(query, userId);

    res.json({
      rooms: result.rooms.map((room) => ({
        ...room,
        createdAt: room.createdAt.toISOString(),
      })),
      nextCursor: result.nextCursor,
      meta: result.meta,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message });
      return;
    }

    throw error;
  }
}
