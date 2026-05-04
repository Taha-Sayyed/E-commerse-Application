import express from "express";
import { getAllProducts, getFeaturedProducts, getProductsByCategory, getRecommendedProducts, createProduct, toggleFeaturedProduct, deleteProduct } from "../controllers/product.controller.js"
import { protectRoute, adminRoute } from '../middleware/auth.middleware.js'
import { validate } from "../middleware/validate.js"
import { createProductSchema, productIdParamSchema, categoryParamSchema } from "../validations/product.validation.js"
import { csrfProtection } from '../middleware/csrf.middleware.js'


const router = express.Router();

router.get('/csrf-token', csrfProtection, (req, res) => {
    res.json({ csrfToken: req.csrfToken() });
});

router.get("/", protectRoute, adminRoute, getAllProducts);
router.get("/featured", getFeaturedProducts);
router.get("/category/:category", validate(categoryParamSchema, "params"), getProductsByCategory);
router.get("/recommendations", getRecommendedProducts);
router.post("/", protectRoute, adminRoute, csrfProtection, validate(createProductSchema, "body"), createProduct);
router.patch("/:id", protectRoute, adminRoute, csrfProtection, validate(productIdParamSchema, "params"), toggleFeaturedProduct);
router.delete("/:id", protectRoute, adminRoute, csrfProtection, validate(productIdParamSchema, "params"), deleteProduct);

export default router