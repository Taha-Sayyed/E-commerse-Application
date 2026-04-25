import jwt from "jsonwebtoken";
import User from '../models/user.model.js'

export const verifyAccessToken=(token)=>{
    try{
        return jwt.verify(token,process.env.ACCESS_TOKEN_SECRET)
    }
    catch(error){
        if(error.name==="TokenExpiredError"){
            throw new Error("TOKEN_EXPIRED")
        }
        throw new Error("INVALID_TOKEN");
    }
};

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

