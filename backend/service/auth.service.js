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
            throw new Error(`TOKEN_EXPIRED: ${error.message}`)
        }
        throw new Error(`INVALID_TOKEN: ${error.message}`);
    }
};

export const verifyRefreshToken=(token)=>{
    try {
        return jwt.verify(token,ENV.REFRESH_TOKEN_SECRET)
    } catch (error) {
        if(error.name==="TokenExpiredError"){
            throw new Error(`TOKEN_EXPIRED: ${error.message}`)
        }
        throw new Error(`INVALID_TOKEN: ${error.message}`);
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
    await redis.set(`refresh_token:${userId}`,refreshToken,"EX",7 * 24 * 60 * 60) //7days
}

export const decodeRefreshToken=(refreshToken)=>{
    try {
        const decodedToken=verifyRefreshToken(refreshToken)
        return decodedToken
    } catch (error) {
        throw error
    }
}

export const getRefreshTokenFromDB=async(decoded)=>{
    try{
        const refreshToken=await redis.get(`refresh_token:${decoded.userId}`)

        if(refreshToken){
            return refreshToken
        }else{
            console.log("Redis returns null");
            return null
        }
    }catch(error){
        throw new Error(`Failed to fetch Refresh Token from Redis: ${error.message}`);
    }
    
}

/** NOTE👈
 * TTL is a String
 */
export const createAccessToken=(userIdParam,TTL)=>{
    const accessToken=jwt.sign({userId:userIdParam},ENV.ACCESS_TOKEN_SECRET,{expiresIn:TTL});
    return accessToken;
}

export const createRefreshToken=(userIdParam,TTL)=>{
    const refreshToken=jwt.sign({userId:userIdParam},ENV.REFRESH_TOKEN_SECRET,{expiresIn:TTL});
    return refreshToken;
}

export const refreshAccessTokenService = async (refreshTokenFromCookie) => {
    // 1. Check token exists
    if (!refreshTokenFromCookie) {
        throw new Error("NO_TOKEN");
    }

    // 2. Decode token
    const decoded = decodeRefreshToken(refreshTokenFromCookie);

    // 3. Get token from Redis
    const storedToken = await getRefreshTokenFromDB(decoded);

    // 4. Handle null (session expired)
    if (!storedToken) {
        throw new Error("SESSION_EXPIRED");
    }

    // 5. Validate token match
    if (storedToken !== refreshTokenFromCookie) {
        throw new Error("INVALID_TOKEN");
    }

    // 6. Create new access token
    const accessToken = createAccessToken(decoded.userId, "15m");

    // 7. Rotate refresh token for security
    const newRefreshToken = createRefreshToken(decoded.userId, "7d");
    await storeRefreshToken(decoded.userId, newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken };
};
