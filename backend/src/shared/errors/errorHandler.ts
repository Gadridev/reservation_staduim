import type { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const isDev = process.env.NODE_ENV === "development";

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        message: err.message,
        ...(isDev && { stack: err.stack }),
      },
    });
  }

  console.error("ERROR 💥", err);

  return res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      ...(isDev && { stack: err.stack }),
    },
  });
}