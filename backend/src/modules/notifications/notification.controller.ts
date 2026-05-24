import type { Request, Response } from "express";

import { ZodError } from "zod";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";

import { AppError } from "../../utils/asyncHandler";

import {

  deleteNotificationsSchema,

  listNotificationsQuerySchema,

  parseListNotificationsQuery,

  updateNotificationPreferencesSchema,

} from "./notification.schemas";

import * as notificationService from "./notification.service";



function handleValidationError(error: ZodError, res: Response) {

  const message = error.issues[0]?.message ?? "Geçersiz istek";

  res.status(400).json({ message });

}



export async function getNotifications(req: Request, res: Response) {

  try {

    const { userId } = req as AuthenticatedRequest;

    const parsed = listNotificationsQuerySchema.parse(req.query);

    const query = parseListNotificationsQuery(parsed);

    const result = await notificationService.listNotifications(userId, query);

    res.json(result);

  } catch (error) {

    if (error instanceof ZodError) {

      handleValidationError(error, res);

      return;

    }



    throw error;

  }

}



export async function getUnreadCount(req: Request, res: Response) {

  const { userId } = req as AuthenticatedRequest;

  const unreadCount = await notificationService.getUnreadCount(userId);

  res.json({ unreadCount });

}



export async function getPreferences(req: Request, res: Response) {

  const { userId } = req as AuthenticatedRequest;

  const result = await notificationService.getNotificationPreferences(userId);

  res.json(result);

}



export async function updatePreferences(req: Request, res: Response) {

  try {

    const { userId } = req as AuthenticatedRequest;

    const body = updateNotificationPreferencesSchema.parse(req.body);

    const result = await notificationService.updateNotificationPreferences(

      userId,

      body,

    );

    res.json(result);

  } catch (error) {

    if (error instanceof ZodError) {

      handleValidationError(error, res);

      return;

    }



    throw error;

  }

}



export async function markAsRead(req: Request, res: Response) {

  const { userId } = req as AuthenticatedRequest;

  const notificationId = String(req.params.notificationId);

  const notification = await notificationService.markNotificationAsRead(

    userId,

    notificationId,

  );



  if (!notification) {

    throw new AppError(404, "Bildirim bulunamadı");

  }



  res.json({ notification });

}



export async function markAllAsRead(req: Request, res: Response) {

  const { userId } = req as AuthenticatedRequest;

  const result = await notificationService.markAllNotificationsAsRead(userId);

  res.json(result);

}



export async function deleteNotificationById(req: Request, res: Response) {

  const { userId } = req as AuthenticatedRequest;

  const notificationId = String(req.params.notificationId);

  const result = await notificationService.deleteNotification(

    userId,

    notificationId,

  );

  res.json(result);

}



export async function deleteAllNotifications(req: Request, res: Response) {

  try {

    const { userId } = req as AuthenticatedRequest;

    const body = deleteNotificationsSchema.parse(req.body ?? {});

    const result = await notificationService.deleteNotifications(userId, body);

    res.json(result);

  } catch (error) {

    if (error instanceof ZodError) {

      handleValidationError(error, res);

      return;

    }



    throw error;

  }

}


