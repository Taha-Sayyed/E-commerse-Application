import axios from "../lib/axios";

export const postProductDataService = async (productData) => {
    const res = await axios.post("/products",productData);
    return res.data;
}