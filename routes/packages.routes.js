import { Router } from "express";
import {
  getAllPackages,
  getPackageById,
  favAPackage,
  unfavAPackage,
  getFavourites,
} from "../controller/packages.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const router = Router();

router.get("/", getAllPackages);
router.get("/favourites", authenticate, getFavourites);
router.get("/:id", getPackageById);
router.post("/:packageId/favourite", authenticate, favAPackage);
router.delete("/:packageId/favourite", authenticate, unfavAPackage);
