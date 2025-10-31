import { Router } from "express";
import {
  bookaPackage,
  validateCoupon,
  getCouponsForPackage,
  getMyOrders,
} from "../controller/order.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const router = Router();

router.get("/coupons/:packageId", getCouponsForPackage);
router.post("/validate-coupon", validateCoupon);
router.post("/experiences/:packageId/book", authenticate, bookaPackage);
router.get("/my-orders", authenticate, getMyOrders);
