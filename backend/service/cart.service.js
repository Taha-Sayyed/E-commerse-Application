import Product from '../models/product.model.js'
import { AppError } from '../lib/appError.js'

export const saveUserToDB = async (user) => {
    try {
        await user.save()
    } catch (error) {
        throw new AppError("Failed to save user in DB", 500);
    }
}

export const getCartProductsService = async (user) => {
    try {
        const validCartItems = user.cartItems.filter(item => item.product);
        const products = await Product.find({
            _id: { $in: validCartItems.map(item => item.product) }
        });

        const cartItems = products.map((product) => {
            const item = validCartItems.find(
                (cartItem) => cartItem.product.toString() === product._id.toString()
            );

            return {
                ...product.toJSON(),
                quantity: item.quantity,
            };
        });

        return cartItems;
    } catch (error) {
        throw new AppError("Failed to fetch products from Cart", 500);
    }
};

export const addToCartService = async (productId, user) => {
    try {
        user.cartItems = user.cartItems.filter(item => item.product);
        const existingItem = user.cartItems.find(
            (item) => item.product.toString() === productId
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cartItems.push({ product: productId, quantity: 1 });
        }

        await user.save();
        return user.cartItems;

    } catch (error) {
        throw new AppError("Failed to add product in Cart", 500);
        // throw new AppError(error.message, 500);
    }

}


