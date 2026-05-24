import type { Request, Response } from "express";
import * as betaService from "../beta/beta.service";

export async function getPublicConfig(_req: Request, res: Response) {
  res.json(betaService.getPublicConfig());
}
