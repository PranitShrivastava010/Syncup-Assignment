import { Router } from "express";
import {
  createJobController,
  getJobByIdController,
  listJobsController,
} from "../controller/jobs.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createJobSchema,
  jobIdParamSchema,
} from "../validations/jobs.validation";

const router = Router();

router.get("/", authMiddleware, listJobsController);
router.post(
  "/",
  authMiddleware,
  requireRole("RECRUITER"),
  validate(createJobSchema),
  createJobController
);
router.get("/:id", validate(jobIdParamSchema), getJobByIdController);

export default router;
