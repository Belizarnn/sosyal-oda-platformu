import type { Request, Response } from "express";

import { ZodError } from "zod";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";

import { listMessagesQuerySchema } from "./message.schemas";

import * as messageService from "./message.service";



export async function getRoomMessages(req: Request, res: Response) {

  try {

    const roomId = String(req.params.roomId);

    const { userId } = req as AuthenticatedRequest;

    const query = listMessagesQuerySchema.parse(req.query);

    const result = await messageService.getRoomMessages(roomId, userId, query);

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

