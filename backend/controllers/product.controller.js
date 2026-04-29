import { AppError } from "../lib/appError.js"
import { getAllProductsFromDB, getAllProductsFromRedis, getFeaturedProductsFromDB, storeFeaturedProductsOnRedis, getProductsByCategoryFromDB, getProductsSampleFromDB, uploadImagesToStore, setProducts, getProductByIdFromDB, saveProductToDB, updateFeaturedProductsCache, deleteImageFromStore, deleteProductByID } from "../service/product.service.js"

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

export const getProductsByCategory = async (req, res) => {
    const { category } = req.params;

    try {
        const products = await getProductsByCategoryFromDB(category);
        res.json({ products });
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const getRecommendedProducts = async (req, res) => {
    try {
        const products = await getProductsSampleFromDB(4);
        res.json(products)
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, image, category } = req.body;
        if (!name || !description || !price || !category) {
            return res.status(400).json({ message: "Missing required fields: name, description, price, category" });
        }
        const product = await setProducts(name, description, price, image, category)
        res.status(201).json(product)
    }
    catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
        // return res.status(500).json({ message: error.message });
    }
}

export const toggleFeaturedProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await getProductByIdFromDB(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        product.isFeatured = !product.isFeatured;
        const updatedProduct = await saveProductToDB(product);
        await updateFeaturedProductsCache();
        res.json(updatedProduct)

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id
        const product = await getProductByIdFromDB(id)

        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        if (product.image) {
            const publicId = product.image.split("/").pop().split(".")[0];
            try {
                await deleteImageFromStore(publicId);
                await deleteProductByID(id)
                res.json({ message: "Product deleted successfully" });
            } catch (error) {
                res.json({ message: error.message });
            }
        }

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}