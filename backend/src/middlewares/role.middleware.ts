import type { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const requireRole =
  (...allowedRoles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.userId) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        select: { role: true },
      });

      if (!user || !allowedRoles.includes(user.role)) {
        res.status(403).json({
          success: false,
          message: "Forbidden: insufficient role",
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
