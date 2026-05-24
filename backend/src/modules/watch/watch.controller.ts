import type { Request, Response } from "express";
import { ZodError } from "zod";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  addToWatchQueueSchema,
  setWatchMediaSchema,
  setWatchVideoSchema,
  watchControlSchema,
  watchCountdownSchema,
  watchReadySchema,
} from "./watch.schemas";
import * as watchService from "./watch.service";

function handleZodError(error: unknown, res: Response): boolean {
  if (error instanceof ZodError) {
    const message = error.issues[0]?.message ?? "Geçersiz istek";
    res.status(400).json({ message });
    return true;
  }
  return false;
}

export async function getWatchState(req: Request, res: Response) {
  const roomId = String(req.params.roomId);
  const { userId } = req as AuthenticatedRequest;
  const result = await watchService.getWatchState(roomId, userId);
  res.json(result);
}

export async function getWatchQueue(req: Request, res: Response) {
  const roomId = String(req.params.roomId);
  const { userId } = req as AuthenticatedRequest;
  const queue = await watchService.getWatchQueue(roomId, userId);
  res.json({ queue });
}

export async function addToWatchQueue(req: Request, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const { userId } = req as AuthenticatedRequest;
    const body = addToWatchQueueSchema.parse(req.body);
    const item = await watchService.addToWatchQueue(roomId, userId, body.videoUrl);
    res.status(201).json({ item });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    throw error;
  }
}

export async function removeFromWatchQueue(req: Request, res: Response) {
  const roomId = String(req.params.roomId);
  const itemId = String(req.params.itemId);
  const { userId } = req as AuthenticatedRequest;
  const result = await watchService.removeFromWatchQueue(roomId, userId, itemId);
  res.json(result);
}

export async function playQueueItem(req: Request, res: Response) {
  const roomId = String(req.params.roomId);
  const itemId = String(req.params.itemId);
  const { userId } = req as AuthenticatedRequest;
  const result = await watchService.playQueueItem(roomId, userId, itemId);
  res.json(result);
}

export async function setWatchVideo(req: Request, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const { userId } = req as AuthenticatedRequest;
    const body = setWatchVideoSchema.parse(req.body);
    const mediaState = await watchService.setWatchVideo(roomId, userId, body.videoUrl);
    res.json({ mediaState });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    throw error;
  }
}

export async function setWatchMedia(req: Request, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const { userId } = req as AuthenticatedRequest;
    const body = setWatchMediaSchema.parse(req.body);
    const mediaState = await watchService.setWatchMedia(roomId, userId, body);
    res.json({ mediaState });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    throw error;
  }
}

export async function setWatchReady(req: Request, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const { userId } = req as AuthenticatedRequest;
    const body = watchReadySchema.parse(req.body);
    const readyUsers = await watchService.setWatchReady(roomId, userId, body);
    res.json({ readyUsers });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    throw error;
  }
}

export async function startWatchCountdown(req: Request, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const { userId } = req as AuthenticatedRequest;
    const body = watchCountdownSchema.parse(req.body);
    const result = await watchService.startWatchCountdown(roomId, userId, body);
    res.json(result);
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    throw error;
  }
}

export async function controlWatch(req: Request, res: Response) {
  try {
    const roomId = String(req.params.roomId);
    const { userId } = req as AuthenticatedRequest;
    const body = watchControlSchema.parse(req.body);
    const mediaState = await watchService.controlWatch(roomId, userId, body);
    res.json({ mediaState });
  } catch (error) {
    if (handleZodError(error, res)) {
      return;
    }
    throw error;
  }
}

export async function takeWatchHost(req: Request, res: Response) {
  const roomId = String(req.params.roomId);
  const { userId } = req as AuthenticatedRequest;
  const mediaState = await watchService.takeWatchHost(roomId, userId);
  res.json({ mediaState });
}
