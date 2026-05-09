import { Router } from "express";
import applicationRoutes from "./application.routes";
import authRoutes from "./auth.routes";
import jobsRoutes from "./jobs.routes";
import notificationRoutes from "./notification.routes";
import resumeRoutes from "./resume.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/jobs", jobsRoutes);
router.use("/applications", applicationRoutes);
router.use("/resumes", resumeRoutes);
router.use("/notifications", notificationRoutes);

export default router;
