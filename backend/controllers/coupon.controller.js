import { getCouponService, validateCouponService, saveCoupon } from "../service/coupon.service.js"
import { AppError } from "../lib/appError.js"

export const getCoupon = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user._id
        const coupon = await getCouponService(userId)
        res.json(coupon || null)

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const validateCoupon = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const userId = req.user._id
        const { code } = req.body

        const coupon = await validateCouponService(userId, code);

        if (!coupon) {
            return res.status(404).json({
                message: "Coupon not found"
            })
        }

        if (coupon.expirationDate < new Date()) {
            coupon.isActive = false
            await saveCoupon(coupon);
            return res.status(404).json({
                message: "Coupon Expired"
            })
        }

        res.json({
            message:"Coupon is Valid",
            code:coupon.code,
            discountPercentage:coupon.discountPercentage
        })

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}