import {configureStore} from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice.js'
import cartReducer from '../features/cart/cartSlice.js'

const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer
    }
})

export default store