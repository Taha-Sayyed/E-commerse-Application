import { jest } from "@jest/globals";
import { AppError } from "../lib/appError.js";

// mock Coupon model
jest.unstable_mockModule("../models/coupon.model.js", () => ({
    default: {
        findOne: jest.fn(),
    },
}));

const Coupon = (await import("../models/coupon.model.js")).default;

const {
    getCouponService,
    validateCouponService,
    saveCoupon,
} = await import("../service/coupon.service.js");

describe("getCouponService", () => {

    it("should return active coupon", async () => {
        const mockCoupon = { code: "ABC" };

        Coupon.findOne.mockResolvedValue(mockCoupon);

        const result = await getCouponService("user1");

        expect(Coupon.findOne).toHaveBeenCalledWith({
            userId: "user1",
            isActive: true,
            expirationDate: expect.any(Object),
        });

        expect(result).toEqual(mockCoupon);
    });

    it("should throw if DB fails", async () => {
        Coupon.findOne.mockRejectedValue(new Error());

        await expect(getCouponService("user1"))
            .rejects.toThrow("Failed to get coupon for user");
    });

});

describe("validateCouponService", () => {

    it("should return coupon if valid", async () => {
        const mockCoupon = { code: "ABC" };

        Coupon.findOne.mockResolvedValue(mockCoupon);

        const result = await validateCouponService("user1", "ABC");

        expect(Coupon.findOne).toHaveBeenCalledWith({
            code: "ABC",
            userId: "user1",
            isActive: true,
            expirationDate: expect.any(Object),
        });

        expect(result).toEqual(mockCoupon);
    });

    it("should return null if coupon not found", async () => {
        Coupon.findOne.mockResolvedValue(null);

        const result = await validateCouponService("user1", "XYZ");

        expect(result).toBeNull();
    });

});

describe("saveCoupon", () => {

    it("should save coupon successfully", async () => {
        const mockCoupon = {
            save: jest.fn().mockResolvedValue({ code: "ABC" })
        };

        const result = await saveCoupon(mockCoupon);

        expect(mockCoupon.save).toHaveBeenCalled();
        expect(result).toEqual({ code: "ABC" });
    });

    it("should throw if save fails", async () => {
        const mockCoupon = {
            save: jest.fn().mockRejectedValue(new Error())
        };

        await expect(saveCoupon(mockCoupon))
            .rejects.toThrow("Failed to save coupon");
    });

});

