import Product from '../models/product.model.js'
import { AppError } from '../lib/appError.js'
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

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

export const getProductsByCategoryFromDB = async (category) => {
    try {
        const products = await Product.find({ category })
        return products;
    } catch (error) {
        throw new AppError("Failed to get products by category", 500);
    }
}

export const getProductsSampleFromDB = async (size) => {
    try {
        const products = await Product.aggregate([
            {
                $sample: { size: size },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    description: 1,
                    image: 1,
                    price: 1,
                },
            },
        ]);

        return products

    } catch (error) {
        throw new AppError("Failed to fetch Recommended Products from DB", 500);
    }
}

export const uploadImagesToStore = async (image) => {
    try {
        let cloudinaryResponse = null;
        if (image) {
            cloudinaryResponse = await cloudinary.uploader.upload(image, { folder: "products" });
        }
        return cloudinaryResponse
    } catch (error) {
        throw new AppError("Failed to store image to Store", 500);
        // throw new AppError(error.message, 500);
    }
}

export const setProducts = async (name, description, price, image, category) => {
    try {

        const cloudinaryResponse = await uploadImagesToStore(image)

        const product = await Product.create({
            name,
            description,
            price,
            image: cloudinaryResponse?.secure_url ? cloudinaryResponse.secure_url : "",
            category

        })

        return product

    } catch (error) {
        if (error instanceof AppError) {
            throw error;
        }
        throw new AppError("Failed to create Products",500);
        // throw new AppError(error.message,500);
    }
}