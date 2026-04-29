import axios from "../lib/axios";

export const addProduct = async (productData) => {
    const res = await axios.post("/products", productData);
    return res.data;
}

export const getAllProducts = async () => {
    const res = await axios.get("/products")
    return res.data
}