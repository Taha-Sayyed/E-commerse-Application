import { ENV } from "../lib/env.js"
import { AppError } from "../lib/appError.js"
import { decodeRefreshToken, storeRefreshToken, createAccessToken, refreshAccessTokenService, findUserByEmail, createNewUser, createRefreshToken, comparePasswordAuth, deleteRefreshTokenFromDB } from "../service/auth.service.js"


const setCookies = (res, accessToken, refreshToken) => {

    /**
     * Sends a cookie from the server to the browser
     * 
     * httpOnly: true: The cookie cannot be accessed via JavaScript. Only the browser can send it automatically with requests
     * 
     * secure:Cookie is sent only over HTTPS in production.In development mode, it can still works without HTTPS
     * 
     * sameSite: "strict": Cookie is sent only when the request originates from the same site
     * 
     * Cookie expires after 15 minutes
     */

    //Cookie name: accessToken 
    res.cookie("accessToken", accessToken, {
        httpOnly: true, // prevent XSS attacks, cross site scripting attack
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
        maxAge: 15 * 60 * 1000, // 15 minutes
    });

    //Cookie name: refreshToken
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true, // prevent XSS attacks, cross site scripting attack
        secure: ENV.NODE_ENV === "production",
        sameSite: "strict", // prevents CSRF attack, cross-site request forgery attack
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
}

//👇This will refresh the access Token

export const refreshToken = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies.refreshToken;
        const { accessToken, refreshToken: newRefreshToken } = await refreshAccessTokenService(refreshTokenFromCookie);

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        });

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: ENV.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.json({ message: "Token refreshed successfully" });

    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
};

export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ message: "Email, password, and name are required" });
        }

        const userExists = await findUserByEmail(email);
        if (userExists) {
            return res.status(409).json({ message: "User already exists" });
        }

        const user = await createNewUser(name, email, password);
        const accessToken = createAccessToken(user._id, "15m");
        const refreshToken = createRefreshToken(user._id, "7d");

        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        })
    } catch (error) {
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isMatch = await comparePasswordAuth(user, password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const accessToken = createAccessToken(user._id, "15m");
        const refreshToken = createRefreshToken(user._id, "7d");

        await storeRefreshToken(user._id, refreshToken);
        setCookies(res, accessToken, refreshToken);

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        });

    } catch (error) {
        console.log(error);
        
        if (error instanceof AppError) {
            return res.status(error.statusCode).json({ message: error.message });
        }
        return res.status(500).json({ message: "Server error" });
    }
}

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            try {
                const decoded = decodeRefreshToken(refreshToken);
                await deleteRefreshTokenFromDB(decoded);
            } catch (err) {
                // Token may be invalid during logout, skip Redis delete
            }
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });

    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
}

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        return res.status(500).json({ message: "Server error" });
    }
};