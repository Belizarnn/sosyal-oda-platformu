import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { sendFriendRequestSchema } from "./friend.schemas";
import * as friendService from "./friend.service";

function handleValidationError(error: ZodError, res: Response) {
  const message = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message });
}

export async function sendFriendRequest(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = sendFriendRequestSchema.parse(req.body);
    const result = await friendService.sendFriendRequest(userId, input);
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }

    throw error;
  }
}

export async function getIncomingFriendRequests(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await friendService.getIncomingFriendRequests(userId);
  res.json(result);
}

export async function getOutgoingFriendRequests(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await friendService.getOutgoingFriendRequests(userId);
  res.json(result);
}

export async function acceptFriendRequest(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const requestId = String(req.params.requestId);
  const result = await friendService.acceptFriendRequest(requestId, userId);
  res.json(result);
}

export async function rejectFriendRequest(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const requestId = String(req.params.requestId);
  const result = await friendService.rejectFriendRequest(requestId, userId);
  res.json(result);
}

export async function cancelFriendRequest(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const requestId = String(req.params.requestId);
  const result = await friendService.cancelFriendRequest(requestId, userId);
  res.json(result);
}

export async function getFriends(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await friendService.getFriends(userId);
  res.json(result);
}

export async function getFriendsActivity(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await friendService.getFriendsActivity(userId);
  res.json(result);
}

export async function removeFriend(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const targetUserId = String(req.params.userId);
  const result = await friendService.removeFriend(userId, targetUserId);
  res.json(result);
}
