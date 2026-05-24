import type { Request, Response } from "express";
import { ZodError } from "zod";
import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import {
  listDmMessagesQuerySchema,
  sendDmMessageSchema,
  startDirectConversationSchema,
} from "./dm.schemas";
import * as dmService from "./dm.service";

function handleValidationError(error: ZodError, res: Response) {
  const message = error.issues[0]?.message ?? "Geçersiz istek";
  res.status(400).json({ message });
}

export async function getConversations(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const result = await dmService.getConversations(userId);
  res.json(result);
}

export async function startDirectConversation(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const input = startDirectConversationSchema.parse(req.body);
    const result = await dmService.startDirectConversation(userId, input);
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }

    throw error;
  }
}

export async function getConversationMessages(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const conversationId = String(req.params.conversationId);
    const query = listDmMessagesQuerySchema.parse(req.query);
    const result = await dmService.getConversationMessages(
      userId,
      conversationId,
      query,
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

export async function sendConversationMessage(req: Request, res: Response) {
  try {
    const { userId } = req as AuthenticatedRequest;
    const conversationId = String(req.params.conversationId);
    const input = sendDmMessageSchema.parse(req.body);
    const result = await dmService.sendConversationMessage(
      userId,
      conversationId,
      input,
    );
    res.status(201).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      handleValidationError(error, res);
      return;
    }

    throw error;
  }
}

export async function deleteConversationMessage(req: Request, res: Response) {
  const { userId } = req as AuthenticatedRequest;
  const conversationId = String(req.params.conversationId);
  const messageId = String(req.params.messageId);
  const result = await dmService.deleteConversationMessage(
    userId,
    conversationId,
    messageId,
  );
  res.json(result);
}
