import { jest } from "@jest/globals";
import { AppError } from "../lib/appError.js";

// mock stripe wrapper
jest.unstable_mockModule("../lib/stripe.js", () => ({
    stripe: {
        coupons: {
            create: jest.fn(),
        },
        checkout: {
            sessions: {
                create: jest.fn(),
                retrieve: jest.fn(),
            },
        },
    },
}));

// mock Coupon model
jest.unstable_mockModule("../models/coupon.model.js", () => ({
    default: {
        findOneAndDelete: jest.fn(),
        findOneAndUpdate: jest.fn(),
    },
}));

// mock Order model
jest.unstable_mockModule("../models/orders.model.js", () => ({
    default: jest.fn().mockImplementation((data) => ({
        ...data,
        save: jest.fn(),
    })),
}));

// mock saveCoupon service
jest.unstable_mockModule("../service/coupon.service.js", () => ({
    saveCoupon: jest.fn(),
}));


const { stripe } = await import("../lib/stripe.js");
const Coupon = (await import("../models/coupon.model.js")).default;
const Order = (await import("../models/orders.model.js")).default;
const { saveCoupon } = await import("../service/coupon.service.js");

const {
    createStripeCoupon,
    createStripeCheckoutSessionService,
    retrieveStripeCheckoutSession,
    createNewOrder,
    saveNewOrder,
} = await import("../service/payment.service.js");


describe("createStripeCoupon", () => {

    it("should create stripe coupon", async () => {
        stripe.coupons.create.mockResolvedValue({ id: "coupon_123" });

        const result = await createStripeCoupon(10);

        expect(result).toBe("coupon_123");
    });

    it("should throw for invalid percentage", async () => {
        await expect(createStripeCoupon(200))
            .rejects.toThrow("Discount percentage must be a number between 0 and 100");
    });

});

describe("createStripeCheckoutSessionService", () => {

    it("should create checkout session", async () => {
        stripe.checkout.sessions.create.mockResolvedValue({ id: "session_123" });

        const result = await createStripeCheckoutSessionService(
            [{ price: "p1", quantity: 1 }],
            "user1",
            null,
            null,
            [{ _id: "p1", quantity: 1, price: 100 }]
        );

        expect(stripe.checkout.sessions.create).toHaveBeenCalled();
        expect(result).toEqual({ id: "session_123" });
    });

});

describe("retrieveStripeCheckoutSession", () => {

    it("should retrieve session", async () => {
        stripe.checkout.sessions.retrieve.mockResolvedValue({ id: "session_123" });

        const result = await retrieveStripeCheckoutSession("session_123");

        expect(result.id).toBe("session_123");
    });

    it("should throw if no sessionId", async () => {
        await expect(retrieveStripeCheckoutSession(null))
            .rejects.toThrow("Session ID is required");
    });

});

describe("createNewOrder", () => {

    it("should create order object", async () => {
        const result = await createNewOrder(
            "user1",
            [{ id: "p1", quantity: 2, price: 100 }],
            200,
            "session1"
        );

        expect(result).toHaveProperty("user", "user1");
        expect(result.products[0].product).toBe("p1");
    });

});

describe("saveNewOrder", () => {

    it("should save order successfully", async () => {
        const mockOrder = {
            save: jest.fn().mockResolvedValue()
        };

        await saveNewOrder(mockOrder);

        expect(mockOrder.save).toHaveBeenCalled();
    });

    it("should ignore duplicate key error", async () => {
        const mockOrder = {
            save: jest.fn().mockRejectedValue({ code: 11000 })
        };

        await saveNewOrder(mockOrder); // should NOT throw
    });

    it("should throw other errors", async () => {
        const mockOrder = {
            save: jest.fn().mockRejectedValue(new Error("fail"))
        };

        await expect(saveNewOrder(mockOrder))
            .rejects.toThrow("Failed to save new order");
    });

});