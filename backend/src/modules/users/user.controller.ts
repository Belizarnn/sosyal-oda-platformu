import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import * as friendService from "../friends/friend.service";
import {
  changePasswordSchema,
  handleParamSchema,
  updatePreferencesSchema,
  updatePresenceSchema,
  updateProfileSchema,
} from "./user.schemas";
import * as userService from "./user.service";

export async function getMe(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const user = await userService.getUserById(userId);
  res.json({ user });
}

export async function getProfileByHandle(req: Request, res: Response) {
  try {
    const { handle } = handleParamSchema.parse({ handle: req.params.handle });
    const profile = await userService.getUserByHandle(handle);
    res.json({ profile });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Geçersiz handle" });
      return;
    }

    throw error;
  }
}

export async function getSocialByHandle(req: Request, res: Response) {
  try {
    const { handle } = handleParamSchema.parse({ handle: req.params.handle });
    const { userId } = req as AuthenticatedRequest;
    const social = await friendService.getUserSocialInfo(userId, handle);
    res.json(social);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: "Geçersiz handle" });
      return;
    }

    throw error;
  }
}

export async function updatePresence(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updatePresenceSchema.parse(req.body);
    const user = await userService.updateUserPresence(userId, input);
    res.json({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message });
      return;
    }

    throw error;
  }
}

export async function updateProfile(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updateProfileSchema.parse(req.body);
    const user = await userService.updateUserProfile(userId, input);
    res.json({ user });
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message });
      return;
    }

    throw error;
  }
}

export async function changePassword(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = changePasswordSchema.parse(req.body);
    const result = await userService.changeUserPassword(userId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message });
      return;
    }

    throw error;
  }
}

export async function updatePreferences(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = updatePreferencesSchema.parse(req.body);
    const result = await userService.updateUserPreferences(userId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      const message = error.issues[0]?.message ?? "Geçersiz istek";
      res.status(400).json({ message });
      return;
    }

    throw error;
  }
}
