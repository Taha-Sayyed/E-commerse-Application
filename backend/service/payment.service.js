import Coupon from "../models/coupon.model.js"
import { saveCoupon } from "./coupon.service.js"
import { AppError } from "../lib/appError.js"
import { stripe } from "../lib/stripe.js"
import { ENV } from "../lib/env.js"

export const deletePreviousCoupon = async (userId) => {
    if (!userId) {
        throw new AppError("User ID is required", 400);
    }

    try {
        await Coupon.findOneAndDelete({ userId })
    } catch (error) {
        throw new AppError(`Failed to delete previous coupon: ${error.message}`, 500);
    }
}

export const createNewCoupon = async (userId) => {
    if (!userId) {
        throw new AppError("User ID is required", 400);
    }

    try {
        await deletePreviousCoupon(userId)

        const newCoupon = new Coupon({
            code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
            discountPercentage: 10,
            expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            userId: userId,
        });

        const savedCoupon = await saveCoupon(newCoupon);
        if (!savedCoupon) {
            throw new Error("Coupon save returned null or undefined");
        }
        return savedCoupon;

    } catch (error) {
        throw new AppError(`Failed to create new coupon: ${error.message}`, 500);
    }
}

export const createStripeCoupon = async (discountPercentage) => {
    if (typeof discountPercentage !== "number" || discountPercentage < 0 || discountPercentage > 100) {
        throw new AppError("Discount percentage must be a number between 0 and 100", 400);
    }

    if (!stripe || typeof stripe.coupons?.create !== "function") {
        throw new AppError("Stripe service is not properly initialized", 500);
    }

    try {
        const coupon = await stripe.coupons.create({
            percent_off: discountPercentage,
            duration: "once"
        });

        if (!coupon || !coupon.id) {
            throw new Error("Stripe returned invalid coupon response");
        }

        return coupon.id;

    } catch (error) {
        throw new AppError(`Failed to create Stripe coupon: ${error.message}`, 500);
    }
}

export const createStripeCheckoutSessionService = async (lineItems, userId, coupon, couponCode, products) => {
    return await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: `${ENV.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ENV.CLIENT_URL}/purchase-cancel`,
        discounts: coupon
            ? [
                {
                    coupon: await createStripeCoupon(coupon.discountPercentage),
                },
            ]
            : [],
        metadata: {
            userId: userId.toString(),
            couponCode: couponCode || "",
            products: JSON.stringify(
                products.map((p) => ({
                    id: p._id,
                    quantity: p.quantity,
                    price: p.price,
                }))
            ),
        },
    });
}