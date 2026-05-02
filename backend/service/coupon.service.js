import { log } from "node:console";
import Coupon from "../models/coupon.model.js";
import { AppError } from "../lib/appError.js";

export const getCouponService = async (user_id) => {
    try {
        const coupon = await Coupon.findOne({
            userId: user_id,
            isActive: true,
            expirationDate: { $gt: new Date() }
        })
        return coupon
    } catch (error) {
        throw new AppError("Failed to get coupon for user", 500);
    }
}

export const validateCouponService = async (user_id, code) => {
    try {
        const coupon = await Coupon.findOne({
            code: code,
            userId: user_id,
            isActive: true,
            expirationDate: { $gt: new Date() }
        });        

        return coupon;
    } catch (error) {
        throw new AppError("Failed to get validate for user", 500);
    }
}

export const saveCoupon = async (coupon) => {
    try {
        return await coupon.save();
    } catch (error) {
        throw new AppError("Failed to save coupon", 500);
        // throw new AppError(`${error.message}`, 500);
    }
}