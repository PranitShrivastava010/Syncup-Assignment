import { Router } from "express";
import {
  applyToJobController,
  getMyApplicationsController,
  updateApplicationStatusController,
} from "../controller/application.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  applyJobSchema,
  updateApplicationStatusSchema,
} from "../validations/application.validation";

const router = Router();

router.get(
  "/",
  authMiddleware,
  requireRole("CANDIDATE"),
  getMyApplicationsController
);
router.post(
  "/",
  authMiddleware,
  requireRole("CANDIDATE"),
  validate(applyJobSchema),
  applyToJobController
);
router.patch(
  "/:id/status",
  authMiddleware,
  requireRole("RECRUITER"),
  validate(updateApplicationStatusSchema),
  updateApplicationStatusController
);

export default router;
