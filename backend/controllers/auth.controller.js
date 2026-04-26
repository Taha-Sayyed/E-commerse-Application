import {redis} from "../lib/redis.js"
import User from "../models/user.model.js"
import jwt from "jsonwebtoken"
import {ENV} from "../lib/env.js"
import {decodeRefreshToken,getRefreshTokenFromDB,storeRefreshToken,createAccessToken} from "../service/auth.service.js"




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

export const refreshToken=async(req,res)=>{
    try {
        const refreshToken=req.cookies.refreshToken;

        if(!refreshToken){
            return res.status(401).json({
                message:"No refresh Token provided"
            })
        }

        const decoded=decodeRefreshToken(refreshToken)

        const storedToken=getRefreshTokenFromDB(decoded);

        if(storedToken !=refreshToken){
            return res.status(401).json({ message: "Invalid refresh token from cookie" });
        }
        
        const accessToken=createAccessToken(decoded.userId,"15m")

        res.cookie("accessToken",accessToken,{
            httpOnly: true,
			secure: ENV.NODE_ENV === "production",
			sameSite: "strict",
			maxAge: 15 * 60 * 1000,
        })

        res.json({ message: "Token refreshed successfully" });

    } catch (error) {
        console.log("Error in refreshToken controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
    }
}