import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/jwtConfig";

type JwtPayload = {
  userId: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const getTokenFromRequest = (req: Request) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return req.cookies?.accessToken;
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromRequest(req);

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_SECRET) as JwtPayload;

    if (!decoded.userId) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
      return;
    }

    req.user = { userId: decoded.userId };
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
