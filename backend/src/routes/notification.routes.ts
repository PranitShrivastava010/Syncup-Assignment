import { Router } from "express";
import {
  getMyNotificationsController,
  markNotificationReadController,
} from "../controller/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { notificationIdParamSchema } from "../validations/notification.validation";

const router = Router();

router.get("/", authMiddleware, getMyNotificationsController);
router.patch(
  "/:id/read",
  authMiddleware,
  validate(notificationIdParamSchema),
  markNotificationReadController
);

export default router;
