import jwt from "jsonwebtoken";
import User from '../models/user.model.js'
import { redis } from "../lib/redis.js"
import { ENV } from "../lib/env.js"
import { AppError } from "../lib/appError.js"

export const verifyAccessToken = (token) => {
    try {
        return jwt.verify(token, ENV.ACCESS_TOKEN_SECRET)
    }
    catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new AppError("Access token expired", 401)
        }
        throw new AppError("Invalid access token", 401);
    }
};

export const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(token, ENV.REFRESH_TOKEN_SECRET)
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            throw new AppError("Refresh token expired", 401)
        }
        throw new AppError("Invalid refresh token", 401);
    }
}

export const getUserFromToken = async (token) => {
    try {
        const decoded = verifyAccessToken(token);
        const user = await User.findById(decoded.userId).select("-password");

        if (!user) {
            throw new AppError("User not found", 404);
        }
        return user;
    } catch (error) {
        if (error instanceof AppError) throw error;
        throw new AppError("Failed to retrieve user", 500);
    }
}

/**NOTE👈
 * Refresh token looks like this in Redis
    
    Key:   refresh_token:123
    Value: abc123token
    TTL:   604800 seconds (7 days)

 * 
 */
export const storeRefreshToken = async (userId, refreshToken) => {
    try {
        await redis.set(`refresh_token:${userId}`, refreshToken, "EX", 7 * 24 * 60 * 60)
    } catch (error) {
        throw new AppError("Failed to store refresh token", 500);
    }
}

export const decodeRefreshToken = (refreshToken) => {
    return verifyRefreshToken(refreshToken);
}

export const getRefreshTokenFromDB = async (decoded) => {
    try {
        const refreshToken = await redis.get(`refresh_token:${decoded.userId}`)
        return refreshToken || null;
    } catch (error) {
        throw new AppError("Failed to fetch refresh token", 500);
    }
}

export const createAccessToken = (userIdParam, TTL) => {
    try {
        return jwt.sign({ userId: userIdParam }, ENV.ACCESS_TOKEN_SECRET, { expiresIn: TTL });
    } catch (error) {
        throw new AppError("Failed to create access token", 500);
    }
}

export const createRefreshToken = (userIdParam, TTL) => {
    try {
        return jwt.sign({ userId: userIdParam }, ENV.REFRESH_TOKEN_SECRET, { expiresIn: TTL });
    } catch (error) {
        throw new AppError("Failed to create refresh token", 500);
    }
}

export const refreshAccessTokenService = async (refreshTokenFromCookie) => {
    if (!refreshTokenFromCookie) {
        throw new AppError("No refresh token provided", 401);
    }

    const decoded = decodeRefreshToken(refreshTokenFromCookie);
    const storedToken = await getRefreshTokenFromDB(decoded);

    if (!storedToken) {
        throw new AppError("Session expired, please log in again", 401);
    }

    if (storedToken !== refreshTokenFromCookie) {
        throw new AppError("Invalid refresh token", 401);
    }

    const accessToken = createAccessToken(decoded.userId, "15m");
    const newRefreshToken = createRefreshToken(decoded.userId, "7d");

    try {
        await storeRefreshToken(decoded.userId, newRefreshToken);
    } catch (error) {
        throw new AppError("Failed to update refresh token", 500);
    }

    return { accessToken, refreshToken: newRefreshToken };
};

//🙌⛏️🧠

export const findUserByEmail = async (email) => {
    try {
        return await User.findOne({ email: email.toLowerCase() });
    } catch (error) {
        throw new AppError("Failed to find user", 500);
    }
}

export const createNewUser = async (name, email, password) => {
    try {
        return await User.create({ name, email, password });
    } catch (error) {
        throw new AppError("Failed to create user", 500);
    }
}

export const comparePasswordAuth = async (user, password) => {
    try {
        return await user.comparePassword(password);
    } catch (error) {
        throw new AppError("Failed to compare password", 500);
    }
}

export const deleteRefreshTokenFromDB = async (decoded) => {
    try {
        return await redis.del(`refresh_token:${decoded.userId}`)
    } catch (error) {
        throw new AppError("Failed to delete refresh token", 500);
    }
}