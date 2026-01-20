import { Router } from "express";
import rateLimit from "express-rate-limit";
import { register, login, logout } from "../controllers/auth.controller.js";

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Za duże obiążenie serwera, spróbuj ponownie",
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);

export default router;
