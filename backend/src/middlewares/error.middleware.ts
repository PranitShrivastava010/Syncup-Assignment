import type { NextFunction, Request, Response } from "express";

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error(err);

  if (err?.code === "P2002") {
    res.status(409).json({
      success: false,
      message: "Record already exists",
    });
    return;
  }

  const statusCode = err?.statusCode || 500;
  const message = err?.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
  });
};
