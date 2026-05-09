import { Router } from "express";
import {
  applyToJobController,
  getMyApplicationsController,
  updateApplicationStatusController,
} from "../controller/application.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  applyJobSchema,
  updateApplicationStatusSchema,
} from "../validations/application.validation";

const router = Router();

router.get("/", authMiddleware, getMyApplicationsController);
router.post("/", authMiddleware, validate(applyJobSchema), applyToJobController);
router.patch(
  "/:id/status",
  authMiddleware,
  validate(updateApplicationStatusSchema),
  updateApplicationStatusController
);

export default router;
