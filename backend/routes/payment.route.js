import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controller.js";
import { validate } from "../middleware/validate.js"
import { createCheckoutSchema, checkoutSuccessSchema } from "../validations/payment.validation.js"


const router = express.Router();

router.post("/create-checkout-session", protectRoute, validate(createCheckoutSchema), createCheckoutSession);
router.post("/checkout-success", protectRoute, validate(checkoutSuccessSchema), checkoutSuccess);

export default router;