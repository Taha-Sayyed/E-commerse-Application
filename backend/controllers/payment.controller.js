import { createStripeCheckoutSessionService, createNewCoupon, retrieveStripeCheckoutSession, updateCoupon, createNewOrder, saveNewOrder } from "../service/payment.service.js"
import { validateCouponService } from "../service/coupon.service.js"
import { AppError } from "../lib/appError.js"


export const createCheckoutSession = async (req, res) => {
    try {
        const { products, couponCode } = req.body;

        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Invalid or empty products array" });
        }

        let totalAmount = 0;

        const lineItems = products.map((product) => {
            const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
            totalAmount += amount * product.quantity;

            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        images: product.image?.startsWith("https://") ? [product.image] : [],
                    },
                    unit_amount: amount,
                },
                quantity: product.quantity || 1,
            };
        });

        let coupon = null;

        if (couponCode && totalAmount >= 20000) {
            coupon = await validateCouponService(req.user._id, couponCode);
            if (coupon) {
                totalAmount -= Math.round((totalAmount * coupon.discountPercentage) / 100);
            }
        }

        const session = await createStripeCheckoutSessionService(lineItems, req.user._id, coupon, couponCode, products)

        if (totalAmount >= 20000) {
            await createNewCoupon(req.user._id);
        }

        res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const checkoutSuccess = async (req, res) => {
    try {
        const { sessionId } = req.body
        const session = await retrieveStripeCheckoutSession(sessionId)

        if (session.payment_status !== "paid") {
            return res.status(400).json({ message: "Payment not completed" });
        }

        if (session.metadata.couponCode) {
            await updateCoupon(session.metadata.couponCode, session.metadata.userId);
        }

        const products = JSON.parse(session.metadata.products);
        const totalAmount = session.amount_total / 100;

        const newOrder = await createNewOrder(session.metadata.userId, products, totalAmount, sessionId);
        await saveNewOrder(newOrder);

        res.status(200).json({
            success: true,
            message: "Payment successful, order created, and coupon deactivated if used.",
            orderId: newOrder._id,
        });


    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}