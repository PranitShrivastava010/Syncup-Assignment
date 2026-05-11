import { Router } from "express";
import {
  getMyResumesController,
  matchResumeController,
  uploadResumeController,
} from "../controller/resume.controller";
import { resumeUpload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/role.middleware";
import { validate } from "../middlewares/validate.middleware";
import { matchResumeParamsSchema } from "../validations/resume.validation";

const router = Router();

router.get("/", authMiddleware, requireRole("CANDIDATE"), getMyResumesController);
router.post(
  "/",
  authMiddleware,
  requireRole("CANDIDATE"),
  resumeUpload.single("resume"),
  uploadResumeController
);
router.post(
  "/:resumeId/match/:jobId",
  authMiddleware,
  requireRole("CANDIDATE"),
  validate(matchResumeParamsSchema),
  matchResumeController
);

export default router;
