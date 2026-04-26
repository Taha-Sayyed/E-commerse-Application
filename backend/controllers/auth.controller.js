import {redis} from "../lib/redis.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import {ENV} from "../lib/env.js"
import {decodeRefreshToken,getRefreshTokenFromDB,storeRefreshToken,createAccessToken,refreshAccessTokenService} from "../service/auth.service.js"


const setCookies=(res,accessToken,refreshToken)=>{

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

//This will refresh the access Token

export const refreshToken = async (req, res) => {
    try {
        const refreshTokenFromCookie = req.cookies.refreshToken;

        const { accessToken, refreshToken: newRefreshToken } = await refreshAccessTokenService(refreshTokenFromCookie);

        // Set both tokens with their respective expiration times
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
        console.log("Error in refreshToken controller", error.message);

        // Handle errors cleanly
        if (error.message === "NO_TOKEN") {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        if (error.message === "SESSION_EXPIRED") {
            return res.status(401).json({ message: "Session expired. Please login again" });
        }

        if (error.message === "INVALID_TOKEN") {
            return res.status(401).json({ message: "Invalid refresh token" });
        }

        if (error.message.includes("TOKEN_EXPIRED")) {
            return res.status(401).json({ message: "Refresh token expired" });
        }

        return res.status(500).json({
            message: "Server error",
            error: error.message,
        });
    }
};