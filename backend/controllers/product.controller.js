import { AppError } from "../lib/appError.js"
import { getAllProductsFromDB, getAllProductsFromRedis, getFeaturedProductsFromDB, storeFeaturedProductsOnRedis } from "../service/product.service.js"

export const getAllProducts = async (req, res) => {
    try {
        const products = await getAllProductsFromDB();
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const getFeaturedProducts = async (req, res) => {
    try {
        let featuredProducts = await getAllProductsFromRedis("featured_products")

        if (featuredProducts) return res.status(200).json(JSON.parse(featuredProducts));

        //If not in redis, fetch from MongoDB

        featuredProducts = await getFeaturedProductsFromDB()

        if (!featuredProducts || featuredProducts.length === 0) {
            return res.status(404).json({ message: "No featured products found" });
        }

        //store in redis
        await storeFeaturedProductsOnRedis("featured_products", featuredProducts)

        res.status(200).json(featuredProducts);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }

}   