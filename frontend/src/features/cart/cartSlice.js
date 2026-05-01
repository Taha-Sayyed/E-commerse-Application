import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { getCoupon, validateCoupon, calculateTotals, getItemFromCart, addProductToCart, deleteFromCart, updateProductQuantity } from '../../service/cart.service.js'



const initialState = {
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false
}

export const getMyCoupon = createAsyncThunk(
    "cart/getMyCoupon",
    async (_, { rejectWithValue }) => {
        try {
            return await getCoupon();
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const applyCoupon = createAsyncThunk(
    "cart/applyCoupon",
    async (code, { rejectWithValue }) => {
        try {
            return await validateCoupon(code)
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const getCartItems = createAsyncThunk(
    "cart/getCartItems",
    async (_, { rejectWithValue }) => {
        try {
            return await getItemFromCart()
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const addToCart = createAsyncThunk(
    "cart/addToCart",
    async (product, { rejectWithValue }) => {
        try {
            return await addProductToCart(product)
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const removeFromCart = createAsyncThunk(
    "cart/removeFromCart",
    async (productId, { rejectWithValue }) => {
        try {
            await deleteFromCart(productId)
            return productId
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const updateQuantity = createAsyncThunk(
    "cart/updateQuantity",
    async ({ productId, quantity }, { rejectWithValue }) => {
        try {
            if (quantity === 0) {
                await deleteFromCart(productId)
                return { productId, quantity: 0 }
            }
            
            await updateProductQuantity(productId, quantity)
            return { productId, quantity }
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)


const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        removeCoupon: (state) => {
            state.coupon = null;
            state.isCouponApplied = false
            const { total, subtotal } = calculateTotals(state.cart, null)
            state.total = total;
            state.subtotal = subtotal;
        },
        clearCart: (state) => {
            state.cart = []
            state.coupon = null
            state.total = 0;
            state.subtotal = 0
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMyCoupon.fulfilled, (state, action) => {
                state.coupon = action.payload
            })
            .addCase(applyCoupon.fulfilled, (state, action) => {
                state.coupon = action.payload;
                state.isCouponApplied = true;
                const { total, subtotal } = calculateTotals(state.cart, state.coupon);
                state.total = total;
                state.subtotal = subtotal;
            })
            .addCase(getCartItems.fulfilled, (state, action) => {
                state.cart = action.payload
                const { total, subtotal } = calculateTotals(state.cart, state.coupon)
                state.total = total;
                state.subtotal = subtotal;
            })
            .addCase(getCartItems.rejected, (state) => {
                state.cart = []
            })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.cart = action.payload
                const { total, subtotal } = calculateTotals(state.cart, state.coupon)
                state.total = total;
                state.subtotal = subtotal;
            })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.cart = state.cart.filter(item => item._id !== action.payload)
                const { total, subtotal } = calculateTotals(state.cart, state.coupon)
                state.total = total;
                state.subtotal = subtotal;
            })
            .addCase(updateQuantity.fulfilled, (state, action) => {
                const { productId, quantity } = action.payload
                if (quantity === 0) {
                    state.cart = state.cart.filter(item => item._id !== productId)
                } else {
                    const item = state.cart.find(item => item._id === productId)
                    if (item) item.quantity = quantity
                }
                const { total, subtotal } = calculateTotals(state.cart, state.coupon)
                state.total = total;
                state.subtotal = subtotal;
            })

    }
})

export const { removeCoupon, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
