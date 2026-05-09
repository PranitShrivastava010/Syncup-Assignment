import { Router } from "express";
import {
  getMyResumesController,
  matchResumeController,
  uploadResumeController,
} from "../controller/resume.controller";
import { resumeUpload } from "../config/multer";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { matchResumeParamsSchema } from "../validations/resume.validation";

const router = Router();

router.get("/", authMiddleware, getMyResumesController);
router.post(
  "/",
  authMiddleware,
  resumeUpload.single("resume"),
  uploadResumeController
);
router.post(
  "/:resumeId/match/:jobId",
  authMiddleware,
  validate(matchResumeParamsSchema),
  matchResumeController
);

export default router;
