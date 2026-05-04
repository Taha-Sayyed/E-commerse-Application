import Order from "../models/orders.model.js";
import Product from "../models/product.model.js";
import User from "../models/user.model.js";
import { AppError } from "../lib/appError.js"

export const totalUserCount = async () => {
    try {
        return await User.countDocuments();
    } catch (error) {
        throw new AppError("Failed to count total Users", 500);
    }
}

export const totalProductsCount = async () => {
    try {
        return await Product.countDocuments();
    } catch (error) {
        throw new AppError("Failed to count total Products", 500);
    }
}

export const salesDataAggregate = async () => {
    try {
        return await Order.aggregate([
            {
                $group: {
                    _id: null, // it groups all documents together,
                    totalSales: { $sum: 1 },
                    totalRevenue: { $sum: "$totalAmount" },
                },
            }
        ])
    } catch (error) {
        throw new AppError("Failed to aggregate sales data", 500);
    }
}


export const getAnalyticsData = async () => {
    try {
        const totalUsers = await totalUserCount();
        const totalProducts = await totalProductsCount();
        const salesData = await salesDataAggregate();

        const { totalSales, totalRevenue } = salesData[0] || { totalSales: 0, totalRevenue: 0 };

        return {
            users: totalUsers,
            products: totalProducts,
            totalSales,
            totalRevenue,
        };

    } catch (error) {
        throw new AppError("Failed to get analytic data", 500);
    }
}

export const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
        dates.push(currentDate.toISOString().split("T")[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
}

export const getDailySalesData = async (startDate, endDate) => {
    try {
        const dailySalesData = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    sales: { $sum: 1 },
                    revenue: { $sum: "$totalAmount" },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        const dateArray = getDatesInRange(startDate, endDate);

        return dateArray.map((date) => {
            const foundData = dailySalesData.find((item) => item._id === date);

            return {
                date,
                sales: foundData?.sales || 0,
                revenue: foundData?.revenue || 0,
            };
        });

    } catch (error) {
        throw new AppError("Error in getting daily sales data",500)
    }
}

