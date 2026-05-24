import type { NextFunction, Request, Response } from "express";

const SKIP_PATHS = new Set(["/health"]);

export function requestLogMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  const path = req.originalUrl.split("?")[0] ?? req.path;

  res.on("finish", () => {
    if (SKIP_PATHS.has(path)) {
      return;
    }

    const durationMs = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${path} ${res.statusCode} ${durationMs}ms`,
    );
  });

  next();
}
