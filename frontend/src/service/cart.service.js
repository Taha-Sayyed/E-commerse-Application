import axios from "../lib/axios";

export const getCoupon = async () => {
    const res = await axios.get("/coupons")
    return res.data;
}

export const getInstantRewardService = async () => {
    const res = await axios.get("/coupons/instant-reward");
    return res.data;
}

export const validateCoupon = async (code) => {
    const res = await axios.post("/coupons/validate", { code });
    return res.data
}

export const calculateTotals = (cart, coupon) => {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let total = subtotal;

    if (coupon && subtotal >= 200) {
        const discount = subtotal * (coupon.discountPercentage / 100);
        total = subtotal - discount;
    }

    return { total, subtotal };
}

export const getItemFromCart = async () => {
    const res = await axios.get("/cart");
    return res.data
}

export const addProductToCart = async (product) => {
    const res = await axios.post("/cart", { productId: product._id });
    return res.data;
}

export const deleteFromCart = async (productId) => {
    await axios.delete(`/cart`, { data: { productId } });
}

export const clearCartService = async () => {
    await axios.delete("/cart", { data: {} });
}

export const updateProductQuantity = async (productId, quantity) => {
    await axios.put(`/cart/${productId}`, { quantity });
}

export const fetchRecommendationsService = async () => {
    const res = await axios.get("/products/recommendations");
    return res.data;
}