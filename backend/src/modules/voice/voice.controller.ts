import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { voiceTokenBodySchema } from "./voice.schemas";
import * as voiceService from "./voice.service";

export async function requestToken(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const body = voiceTokenBodySchema.parse(req.body);
    const tokenResponse = await voiceService.createVoiceToken(
      userId,
      body.roomId,
    );
    res.json(tokenResponse);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message });
      return;
    }

    throw error;
  }
}
