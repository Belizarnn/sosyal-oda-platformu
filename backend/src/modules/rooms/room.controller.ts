import type { Request, Response } from "express";
import { ZodError } from "zod";
import { verifyToken } from "../../lib/jwt";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  createRoomSchema,
  joinRoomSchema,
  listRoomsQuerySchema,
} from "./room.schemas";
import * as roomService from "./room.service";

function handleValidationError(error: ZodError, res: Response) {
  const message = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message });
}

export async function listRooms(req: Request, res: Response) {
  try {
    const query = listRoomsQuerySchema.parse(req.query);
    const { userId } = req as AuthenticatedRequest;
    const rooms = await roomService.listRooms(query, userId);
    res.json(rooms);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }

    throw error;
  }
}

export async function createRoom(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = createRoomSchema.parse(req.body);
    const room = await roomService.createRoom(userId, input);
    res.status(201).json({ room });
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }

    throw error;
  }
}

export async function getRoomById(req: Request, res: Response) {
  const roomId = String(req.params.id);
  const authHeader = req.headers.authorization;
  let userId: string | undefined;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      userId = verifyToken(authHeader.slice(7)).userId;
    } catch {
      userId = undefined;
    }
  }

  const room = await roomService.getRoomById(roomId, userId);
  res.json(room);
}

export async function joinRoom(req: Request, res: Response) {
  try {
    const roomId = String(req.params.id);
    const { userId } = req as AuthenticatedRequest;
    const input = joinRoomSchema.parse(req.body ?? {});
    const result = await roomService.joinRoom(roomId, userId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }

    throw error;
  }
}

export async function leaveRoom(req: Request, res: Response) {
  const roomId = String(req.params.id);
  const { userId } = req as AuthenticatedRequest;
  const result = await roomService.leaveRoom(roomId, userId);
  res.json(result);
}
