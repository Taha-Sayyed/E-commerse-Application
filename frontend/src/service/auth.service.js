import axios from "../lib/axios";

export const signupService = async ({ name, email, password }) => {
    const res = await axios.post("/auth/signup", { name, email, password });

    return res.data
}

export const loginService = async ({ email, password }) => {
    const res = await axios.post("/auth/login", { email, password });

    return res.data
}

export const logoutService = async () => {
    await axios.post("/auth/logout")
}

export const getProfile = async () => {
    const res = await axios.get("/auth/profile")
    return res.data
}

export const refreshTokenService = async () => { 
    const res=await axios.post("/auth/refresh-token")
    return res.data
}