import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { createCheckoutSession, checkoutSuccess } from "../controllers/payment.controller.js";
import { validate } from "../middleware/validate.js"
import { createCheckoutSchema, checkoutSuccessSchema } from "../validations/payment.validation.js"
import { csrfProtection } from '../middleware/csrf.middleware.js'


const router = express.Router();

router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

router.post("/create-checkout-session", protectRoute, csrfProtection, validate(createCheckoutSchema), createCheckoutSession);
router.post("/checkout-success", protectRoute, csrfProtection, validate(checkoutSuccessSchema), checkoutSuccess);

export default router;