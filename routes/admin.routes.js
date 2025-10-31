import { Router } from "express";
import {
  createExperiences,
  deleteExperience,
} from "../controller/admin.controller.js";
import { uploadMiddleware } from "../middleware/multer.js";
import { authenticate } from "../middleware/authenticate.js";

export const router = Router();

router.post(
  "/experiences",
  authenticate,
  uploadMiddleware.array("images", 10),
  createExperiences
);

router.delete("/experiences/:id", authenticate, deleteExperience);
