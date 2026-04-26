import jwt from "jsonwebtoken";
import User from '../models/user.model.js'
import {redis} from "../lib/redis.js"
import {ENV} from "../lib/env.js"

export const verifyAccessToken=(token)=>{
    try{
        return jwt.verify(token,ENV.ACCESS_TOKEN_SECRET)
    }
    catch(error){
        if(error.name==="TokenExpiredError"){
            throw new Error("TOKEN_EXPIRED")
        }
        throw new Error("INVALID_TOKEN");
    }
};

export const verifyRefreshToken=(token)=>{
    try {
        return jwt.verify(token,ENV.REFRESH_TOKEN_SECRET)
    } catch (error) {
        if(error.name==="TokenExpiredError"){
            throw new Error("TOKEN_EXPIRED")
        }
        throw new Error("INVALID_TOKEN");
    }
}

export const getUserFromToken=async (token)=>{
    const decoded=verifyAccessToken(token);

    /**
     * Getting the user data excluding the User password
     */
    const user=await User.findById(decoded.userId).select("-password");

    if(!user){
        throw new Error("USER_NOT_FOUND");
    }
    return user;
}

/**NOTE👈
 * Refresh token looks like this in Redis
    
    Key:   refresh_token:123
    Value: abc123token
    TTL:   604800 seconds (7 days)

 * 
 */
export const storeRefreshToken=async (userId,refreshToken)=>{
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7 * 24 * 60 * 60)
}

export const decodeRefreshToken=(refreshToken)=>{
    try {
        const decodedToken=verifyRefreshToken(refreshToken)
        return decodedToken
    } catch (error) {
        throw new Error("Failed to Decode Refresh Token")
    }
}

export const getRefreshTokenFromDB=async(decoded)=>{
    try{
        const refreshToken=await redis.get(`refresh_token:${decoded.userId}`)
        return refreshToken;
    }catch(error){
        throw new Error("Failed to fetch Refresh Token from Redis"); 
    }
    
}

/** NOTE👈
 * TTL is a String
 */
export const createAccessToken=(userIdParam,TTL)=>{
    const accessToken=jwt.sign({userId:userIdParam},ENV.ACCESS_TOKEN_SECRET,{expiresIn:TTL});
}

export const createRefreshToken=(userIdParam,TTL)=>{
    const refreshToken=jwt.sign({userId:userIdParam},ENV.ACCESS_TOKEN_SECRET,{expiresIn:TTL});
}

