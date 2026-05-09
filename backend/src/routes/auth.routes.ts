import { Router } from "express";
import {
  loginController,
  logoutController,
  meController,
  refreshTokenController,
  registerController,
} from "../controller/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { loginSchema, registerSchema } from "../validations/auth.validation";

const router = Router();

router.post("/register", validate(registerSchema), registerController);
router.post("/login", validate(loginSchema), loginController);
router.post("/refresh", refreshTokenController);
router.post("/logout", logoutController);
router.get("/me", authMiddleware, meController);

export default router;
