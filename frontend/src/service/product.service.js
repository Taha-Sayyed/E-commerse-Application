import axios from "../lib/axios";

export const addProduct = async (productData) => {
    const res = await axios.post("/products", productData);
    return res.data;
}

export const getAllProducts = async () => {
    const res = await axios.get("/products")
    return res.data.data
}

export const getProductByCategory = async (category) => {
    const res = await axios.get(`/products/category/${category}`)
    return res.data
}

export const deleteProductByID = async (productId) => {
    await axios.delete(`/products/${productId}`)
}

export const toggleFeaturedProductByID = async (productId) => {
    const res = await axios.patch(`/products/${productId}`);
    return res.data
}

export const getFeaturedProducts = async () => {
    const res = await axios.get("/products/featured");
    return res.data
}