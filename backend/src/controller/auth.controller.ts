import { Request, Response } from "express";
import {
  getMeService,
  loginService,
  logoutService,
  refreshTokenService,
  registerService,
} from "../service/auth.service";
import {
  clearRefreshCookieOptions,
  refreshCookieOptions,
} from "../utils/cookies";
import { asyncHandler } from "../utils/asyncHandler";

export const registerController = asyncHandler(
  async (req: Request, res: Response) => {
    const { accessToken, refreshToken, sendUser } = await registerService(
      req.body
    );

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      Result: { accessToken, sendUser },
    });
  }
);


export const loginController = asyncHandler(
  async (req: Request, res: Response) => {
    const { accessToken, refreshToken, sendUser } = await loginService(req.body);

    res.cookie("refreshToken", refreshToken, refreshCookieOptions);

    res.status(200).json({
      success: true,
      message: "Login successful",
      Result: { accessToken, sendUser },
    });
  }
);

export const refreshTokenController = asyncHandler(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const result = await refreshTokenService(refreshToken);

    res.cookie("refreshToken", result.refreshToken, refreshCookieOptions);

    res.status(200).json({
      success: true,
      message: "Token refreshed",
      accessToken: result.accessToken,
      user: result.user,
    });
  }
);

export const logoutController = asyncHandler(
  async (req: Request, res: Response) => {
    await logoutService(req.cookies.refreshToken);
    res.clearCookie("refreshToken", clearRefreshCookieOptions);

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

export const meController = asyncHandler(
  async (req: Request, res: Response) => {
    const user = await getMeService(req.user!.userId);

    res.status(200).json({
      success: true,
      result: user,
    });
  }
);
