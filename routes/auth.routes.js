import { Router } from "express";
import { register, verifyEmail, login } from "../controller/auth.controller.js";
export const router = Router();

router.post("/register", register);
router.get("/verify-email", verifyEmail);
router.post("/login", login);
