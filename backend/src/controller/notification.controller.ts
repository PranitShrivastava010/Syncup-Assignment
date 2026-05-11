import { Request, Response } from "express";
import {
  getMyNotificationsService,
  markAllNotificationsReadService,
  markNotificationReadService,
} from "../service/notification.service";
import { asyncHandler } from "../utils/asyncHandler";
import { getPaginationParams } from "../utils/pagination";

export const getMyNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await getMyNotificationsService(
      req.user!.userId,
      getPaginationParams(req.query)
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  }
);

export const markNotificationReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const notification = await markNotificationReadService(
      req.user!.userId,
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      result: notification,
    });
  }
);

export const markAllNotificationsReadController = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await markAllNotificationsReadService(req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Notifications marked as read",
      result,
    });
  }
);
