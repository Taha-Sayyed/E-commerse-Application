import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { signupService, loginService, logoutService, getProfile, refreshTokenService } from '../../service/auth.service.js'

export const signup = createAsyncThunk(
    "auth/signup",
    async ({ name, email, password, confirmPassword }, { rejectWithValue }) => {
        if (password !== confirmPassword) {
            return rejectWithValue("Password do not match");
        }

        try {
            return await signupService({ name, email, password })
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const login = createAsyncThunk(
    "auth/login", //featureName|actionName
    async ({ email, password }, { rejectWithValue }) => {
        try {
            return await loginService({ email, password })
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
        try {
            await logoutService();
            return true;
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, { rejectWithValue }) => {
        try {
            return await getProfile()
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)

export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (_, { rejectWithValue }) => {
        try {
            return await refreshTokenService()
        } catch (error) {
            return rejectWithValue(
                error?.response?.data?.message || "An error occurred"
            );
        }
    }
)


const initialState = {
    user: null,
    loading: false,
    checkingAuth: true
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(signup.pending, (state) => {
                state.loading = true;
            })
            .addCase(signup.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload
            })
            .addCase(signup.rejected, (state) => {
                state.loading = false;
            })
            .addCase(login.pending, (state) => {
                state.loading = true
            })
            .addCase(login.fulfilled, (state, action) => {
                state.user = action.payload
                state.loading = false
            })
            .addCase(login.rejected, (state) => {
                state.loading = false
            })
            .addCase(logout.pending, (state) => {
                state.loading = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
            })
            .addCase(logout.rejected, (state) => {
                state.loading = false;
            })
            .addCase(checkAuth.pending, (state) => {
                state.checkingAuth = true
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.user = action.payload
                state.checkingAuth = false
            })
            .addCase(checkAuth.rejected, (state) => {
                state.user = null
                state.checkingAuth = false
            })
            .addCase(refreshToken.pending, (state) => {
                state.loading = true;
            })
            .addCase(refreshToken.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(refreshToken.rejected, (state) => {
                state.loading = false;
                state.user = null;
            })

    }
})


export default authSlice.reducer