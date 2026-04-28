import Product from '../models/product.model.js'
import { AppError } from '../lib/appError.js'
import { redis } from "../lib/redis.js";

export const getAllProductsFromDB = async () => {
    try {
        const products = await Product.find({});
        return products;
    } catch (error) {
        throw new AppError("Failed to fetch products from database", 500);
    }
}

export const getAllProductsFromRedis = async (key) => {
    try {
        const products = await redis.get(key);//returns string
        return products
    } catch (error) {
        throw new AppError("Failed to fetch from Redis cache", 500);
    }
}

export const getFeaturedProductsFromDB = async () => {
    try {
        const products = await Product.find({ isFeatured: true }).lean();
        return products;
    } catch (error) {
        throw new AppError("Failed to fetch featured products from database", 500);
    }
}

export const storeFeaturedProductsOnRedis = async (key, product) => {
    try {
        await redis.set(key, JSON.stringify(product), "EX", 3600);// 1 Hour
    } catch (error) {
        throw new AppError("Failed to cache featured products", 500);
    }
}