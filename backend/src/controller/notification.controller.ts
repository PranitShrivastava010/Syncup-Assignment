import { Request, Response } from "express";
import {
  getMyNotificationsService,
  markNotificationReadService,
} from "../service/notification.service";
import { asyncHandler } from "../utils/asyncHandler";

export const getMyNotificationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const notifications = await getMyNotificationsService(req.user!.userId);

    res.status(200).json({
      success: true,
      result: notifications,
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
