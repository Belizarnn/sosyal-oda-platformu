import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  createReportSchema,
  muteMemberSchema,
} from "./moderation.schemas";
import * as moderationService from "./moderation.service";

function getIds(req: Request) {
  return {
    roomId: String(req.params.roomId),
    targetUserId: String(req.params.userId),
  };
}

export async function kickMember(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const { roomId, targetUserId } = getIds(req);
  const result = await moderationService.kickMember(roomId, userId, targetUserId);
  res.json(result);
}

export async function muteMember(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const { roomId, targetUserId } = getIds(req);
    const input = muteMemberSchema.parse(req.body);
    const result = await moderationService.muteMember(
      roomId,
      userId,
      targetUserId,
      input,
    );
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.issues[0]?.message ?? "Geçersiz istek" });
      return;
    }
    throw error;
  }
}

export async function unmuteMember(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const { roomId, targetUserId } = getIds(req);
  const result = await moderationService.unmuteMember(roomId, userId, targetUserId);
  res.json(result);
}

export async function banMember(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const { roomId, targetUserId } = getIds(req);
  const result = await moderationService.banMember(roomId, userId, targetUserId);
  res.json(result);
}

export async function unbanMember(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const { roomId, targetUserId } = getIds(req);
  const result = await moderationService.unbanMember(roomId, userId, targetUserId);
  res.json(result);
}

export async function deleteMessage(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const roomId = String(req.params.roomId);
  const messageId = String(req.params.messageId);
  const result = await moderationService.deleteRoomMessage(
    roomId,
    messageId,
    userId,
  );
  res.json(result);
}

export async function createReport(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = createReportSchema.parse(req.body);
    const result = await moderationService.createReport(userId, input);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.issues[0]?.message ?? "Geçersiz istek" });
      return;
    }
    throw error;
  }
}
