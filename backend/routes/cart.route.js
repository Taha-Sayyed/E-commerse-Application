import express from "express";
import { getCartProducts, addToCart, removeFromCart, updateQuantity } from '../controllers/cart.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'
import { validate } from "../middleware/validate.js"
import { addToCartSchema, removeFromCartSchema, updateQuantitySchema, productIdParamSchema } from "../validations/cart.validation.js"
import { csrfProtection } from "../middleware/csrf.middleware.js"

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, csrfProtection, validate(addToCartSchema), addToCart);
router.delete("/", protectRoute, csrfProtection, validate(removeFromCartSchema), removeFromCart);
router.put("/:id", protectRoute, csrfProtection, validate(productIdParamSchema, "params"), validate(updateQuantitySchema), updateQuantity);

export default router;