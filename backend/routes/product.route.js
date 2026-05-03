import express from "express";
import { getAllProducts, getFeaturedProducts, getProductsByCategory, getRecommendedProducts, createProduct, toggleFeaturedProduct, deleteProduct } from "../controllers/product.controller.js"
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js'
import { validate } from "../middleware/validate.js"
import { createProductSchema, productIdParamSchema, categoryParamSchema } from "../validations/product.validation.js"


const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", validate(categoryParamSchema, "params"), getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, validate(createProductSchema, "params"), createProduct);
router.patch("/:id", protectRoute, adminRoute, validate(productIdParamSchema, "params"), toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, validate(productIdParamSchema, "params"), deleteProduct);

export default router