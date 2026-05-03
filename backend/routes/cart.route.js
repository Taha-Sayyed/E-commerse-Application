import express from "express";
import { getCartProducts, addToCart, removeFromCart, updateQuantity } from '../controllers/cart.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'
import { validate } from "../middleware/validate.js"
import { addToCartSchema, removeFromCartSchema, updateQuantitySchema, productIdParamSchema } from "../validations/cart.validation.js"

const router = express.Router();

router.get("/", protectRoute, getCartProducts);
router.post("/", protectRoute, validate(addToCartSchema), addToCart);
router.delete("/", protectRoute, validate(removeFromCartSchema), removeFromCart);
router.put("/:id", protectRoute, validate(productIdParamSchema, "params"), validate(updateQuantitySchema), updateQuantity);

export default router;