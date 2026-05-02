import express from "express";
import { protectRoute, adminRoute } from "../middleware/auth.middleware.js";
import { getCoupon, validateCoupon, createCoupon, getInstantReward } from "../controllers/coupon.controller.js"

const router = express.Router();

router.get("/", protectRoute, getCoupon);
router.post("/validate", protectRoute, validateCoupon);
router.get("/instant-reward", protectRoute, getInstantReward);
// Doubt regarding this route
// router.post("/", protectRoute, createCoupon);

export default router;