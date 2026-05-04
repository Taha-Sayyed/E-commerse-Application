import { jest } from "@jest/globals";
import { AppError } from "../lib/appError.js";

// mock models
jest.unstable_mockModule("../models/user.model.js", () => ({
    default: {
        countDocuments: jest.fn(),
    },
}));

jest.unstable_mockModule("../models/product.model.js", () => ({
    default: {
        countDocuments: jest.fn(),
    },
}));

jest.unstable_mockModule("../models/orders.model.js", () => ({
    default: {
        aggregate: jest.fn(),
    },
}));


const User = (await import("../models/user.model.js")).default;
const Product = (await import("../models/product.model.js")).default;
const Order = (await import("../models/orders.model.js")).default;

const {
    totalUserCount,
    totalProductsCount,
    salesDataAggregate,
    getAnalyticsData,
    getDatesInRange,
    getDailySalesData,
} = await import("../service/analytics.service.js");

describe("totalUserCount", () => {
    it("should return user count", async () => {
        User.countDocuments.mockResolvedValue(10);

        const result = await totalUserCount();

        expect(result).toBe(10);
    });

    it("should throw if DB fails", async () => {
        User.countDocuments.mockRejectedValue(new Error());

        await expect(totalUserCount())
            .rejects.toThrow("Failed to count total Users");
    });
});

describe("totalProductsCount", () => {
    it("should return product count", async () => {
        Product.countDocuments.mockResolvedValue(5);

        const result = await totalProductsCount();

        expect(result).toBe(5);
    });
});

describe("salesDataAggregate", () => {
    it("should return aggregated sales data", async () => {
        const mockData = [{ totalSales: 20, totalRevenue: 5000 }];

        Order.aggregate.mockResolvedValue(mockData);

        const result = await salesDataAggregate();

        expect(result).toEqual(mockData);
    });

    it("should throw if aggregation fails", async () => {
        Order.aggregate.mockRejectedValue(new Error());

        await expect(salesDataAggregate())
            .rejects.toThrow("Failed to aggregate sales data");
    });
});

describe("getAnalyticsData", () => {

    it("should return analytics data", async () => {
        User.countDocuments.mockResolvedValue(10);
        Product.countDocuments.mockResolvedValue(5);
        Order.aggregate.mockResolvedValue([
            { totalSales: 20, totalRevenue: 5000 }
        ]);

        const result = await getAnalyticsData();

        expect(result).toEqual({
            users: 10,
            products: 5,
            totalSales: 20,
            totalRevenue: 5000,
        });
    });

    it("should handle empty sales data", async () => {
        User.countDocuments.mockResolvedValue(10);
        Product.countDocuments.mockResolvedValue(5);
        Order.aggregate.mockResolvedValue([]);

        const result = await getAnalyticsData();

        expect(result.totalSales).toBe(0);
        expect(result.totalRevenue).toBe(0);
    });

});

describe("getDatesInRange", () => {

    it("should return correct date range", () => {
        const result = getDatesInRange(
            new Date("2024-01-01"),
            new Date("2024-01-03")
        );

        expect(result).toEqual([
            "2024-01-01",
            "2024-01-02",
            "2024-01-03",
        ]);
    });

});

describe("getDailySalesData", () => {

    it("should return daily sales data with gaps filled", async () => {
        Order.aggregate.mockResolvedValue([
            { _id: "2024-01-01", sales: 2, revenue: 200 },
            { _id: "2024-01-03", sales: 1, revenue: 100 },
        ]);

        const result = await getDailySalesData(
            new Date("2024-01-01"),
            new Date("2024-01-03")
        );

        expect(result).toEqual([
            { date: "2024-01-01", sales: 2, revenue: 200 },
            { date: "2024-01-02", sales: 0, revenue: 0 }, // gap filled
            { date: "2024-01-03", sales: 1, revenue: 100 },
        ]);
    });

});