import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { updateInviteSettingsSchema } from "./invite.schemas";
import * as inviteService from "./invite.service";

function handleValidationError(error: ZodError, res: Response) {
  const message = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message });
}

export async function getInvitePreview(req: Request, res: Response) {
  const inviteCode = String(req.params.inviteCode);
  const preview = await inviteService.getInvitePreview(inviteCode);
  res.json(preview);
}

export async function regenerateRoomInvite(req: Request, res: Response) {
  const roomId = String(req.params.roomId);
  const { userId } = req as AuthenticatedRequest;
  const result = await inviteService.regenerateRoomInvite(roomId, userId);
  res.json(result);
}

export async function updateInviteSettings(req: Request, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const { userId } = req as AuthenticatedRequest;
    const input = updateInviteSettingsSchema.parse(req.body);
    const result = await inviteService.updateInviteSettings(roomId, userId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }

    throw error;
  }
}
