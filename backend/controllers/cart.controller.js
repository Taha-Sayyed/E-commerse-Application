import Product from "../models/product.model.js"
import { getCartProductsService, addToCartService, saveUserToDB } from "../service/cart.service.js"
import { AppError } from '../lib/appError.js'

export const getCartProducts = async (req, res) => {
    try {
        const cartItems = await getCartProductsService(req.user);
        res.json(cartItems);
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
};

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.body
        const user = req.user

        if (!productId) {
            return res.status(400).json({ message: "productId is required" });
        }

        const cartItems = await addToCartService(productId, user)
        res.json(cartItems);

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.body;
        const user = req.user;

        if (!productId) {
            user.cartItems = [];
        } else {
            user.cartItems = user.cartItems.filter(
                (item) => item.product && item.product.toString() !== productId.toString()
            );
        }

        await saveUserToDB(user)

        res.json(user.cartItems);

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const updateQuantity = async (req, res) => {
    try {
        const { id: productId } = req.params
        const { quantity } = req.body
        const user = req.user

        const existingItem = user.cartItems.find(
            (item) => item.product.toString() === productId
        )

        if (!existingItem) {
            return res.status(404).json({ message: "Item not found in cart" })
        }

        if (quantity === 0) {
            user.cartItems = user.cartItems.filter(
                (item) => item.product.toString() !== productId
            )

            await saveUserToDB(user)
            return res.json(user.cartItems)
        }

        existingItem.quantity = quantity

        await saveUserToDB(user)
        return res.json(user.cartItems)

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}
