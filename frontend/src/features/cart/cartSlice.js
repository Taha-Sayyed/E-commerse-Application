import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { } from '../../service/cart.service'

const initialState = {
    cart: [],
    coupon: null,
    total: 0,
    subtotal: 0,
    isCouponApplied: false
}

