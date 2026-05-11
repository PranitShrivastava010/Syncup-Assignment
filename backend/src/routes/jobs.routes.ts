import { Router } from "express";
import {
  createJobController,
  deactivateRecruiterJobController,
  getJobByIdController,
  getRecruiterJobApplicationsController,
  getRecruiterJobsController,
  listJobsController,
  updateRecruiterJobController,
} from "../controller/jobs.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createJobSchema,
  jobIdParamSchema,
  updateJobSchema,
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
router.get(
  "/my-jobs",
  authMiddleware,
  requireRole("RECRUITER"),
  getRecruiterJobsController
);
router.get(
  "/:id/applications",
  authMiddleware,
  requireRole("RECRUITER"),
  validate(jobIdParamSchema),
  getRecruiterJobApplicationsController
);
router.patch(
  "/:id",
  authMiddleware,
  requireRole("RECRUITER"),
  validate(updateJobSchema),
  updateRecruiterJobController
);
router.delete(
  "/:id",
  authMiddleware,
  requireRole("RECRUITER"),
  validate(jobIdParamSchema),
  deactivateRecruiterJobController
);
router.get("/:id", validate(jobIdParamSchema), getJobByIdController);

export default router;
