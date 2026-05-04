import express from 'express'
import { login, logout, signup, refreshToken, getProfile } from '../controllers/auth.controller.js'
import { protectRoute } from '../middleware/auth.middleware.js'
import { validate } from "../middleware/validate.js"
import { signupSchema, loginSchema } from "../validations/auth.validation.js"
import { csrfProtection } from '../middleware/csrf.middleware.js'

const router = express.Router();

router.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

router.post("/signup", csrfProtection, validate(signupSchema), signup);
router.post("/login", csrfProtection, validate(loginSchema), login);
router.post("/logout", csrfProtection, logout);
router.post("/refresh-token", csrfProtection, refreshToken);
router.get("/profile", protectRoute, getProfile);

export default router;