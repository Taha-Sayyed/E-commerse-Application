import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { postProductDataService } from '../../service/product.service.js'

const initialState = {
    products: [],
    loading: false,
}

export const createProduct = createAsyncThunk(
    "product/createProduct",
    async (productData, { rejectWithValue }) => {
        try {
            return await postProductDataService(productData)

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
    }
})

export const { setProducts } = productSlice.actions

export default productSlice.reducer