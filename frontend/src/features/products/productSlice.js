import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { addProduct, getAllProducts, getProductByCategory, deleteProductByID, toggleFeaturedProductByID, getFeaturedProducts } from '../../service/product.service.js'

const initialState = {
    products: [],
    loading: false,
}

//done
export const createProduct = createAsyncThunk(
    "product/createProduct",
    async (productData, { rejectWithValue }) => {
        try {
            return await addProduct(productData)

        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

//done
export const fetchAllProducts = createAsyncThunk(
    "product/fetchAllProducts",
    async (_, { rejectWithValue }) => {
        try {
            return await getAllProducts()
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }

)

export const fetchProductsByCategory = createAsyncThunk(
    "product/fetchProductsByCategory",
    async (category, { rejectWithValue }) => {
        try {
            return await getProductByCategory(category);
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const deleteProduct = createAsyncThunk(
    "product/deleteProduct",
    async (productId, { rejectWithValue }) => {
        try {
            await deleteProductByID(productId)
            return productId
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const toggleFeaturedProduct = createAsyncThunk(
    "product/toggleFeaturedProduct",
    async (productId, { rejectWithValue }) => {
        try {
            return await toggleFeaturedProductByID(productId)
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const fetchFeaturedProducts = createAsyncThunk(
    "product/fetchFeaturedProducts",
    async (_, { rejectWithValue }) => {
        try {
            return await getFeaturedProducts();
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.products.push(action.payload)
                state.loading = false
            })
            .addCase(createProduct.rejected, (state) => {
                state.loading = false
            })
            .addCase(fetchAllProducts.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchAllProducts.fulfilled, (state, action) => {
                state.products = action.payload
                state.loading = false
            })
            .addCase(fetchAllProducts.rejected, (state) => {
                state.loading = false
            })
            .addCase(fetchProductsByCategory.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchProductsByCategory.fulfilled, (state) => {
                state.products = action.payload.products
                state.loading = false
            })
            .addCase(fetchProductsByCategory.rejected, (state) => {
                state.loading = false
            })
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.products = state.products.filter(
                    (item) => item._id !== action.payload
                )
                state.loading = false
            })
            .addCase(deleteProduct.rejected, (state) => {
                state.loading = false
            })
            .addCase(toggleFeaturedProduct.pending, (state) => {
                state.loading = true
            })
            .addCase(toggleFeaturedProduct.fulfilled, (state, action) => {
                state.products = state.products.map((item) => {
                    if (item._id === action.meta.arg) {
                        return {
                            ...item,
                            isFeatured: action.payload.isFeatured
                        }
                    }
                    return item;
                })
                state.loading = false
            })
            .addCase(toggleFeaturedProduct.rejected, (state) => {
                state.loading = false
            })
            .addCase(fetchFeaturedProducts.pending, (state) => {
                state.loading = true
            })
            .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
                state.products = action.payload
                state.loading = false
            })
            .addCase(fetchFeaturedProducts.rejected, (state) => {
                state.loading = false
            })
    }
})

export const { setProducts } = productSlice.actions

export default productSlice.reducer