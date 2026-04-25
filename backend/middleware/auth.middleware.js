import { getUserFromToken } from '../service/auth.service.js'

export const protectRoute = async (req, res, next) => {
    try {
        const accessToken = req.cookies.accessToken;

        if (!accessToken) {
            return res.status(401).json({
                message: "No access token provided"
            })
        }

        const user = await getUserFromToken(accessToken);
        req.user = user;
        next();
    }
    catch (error) {
        switch (error.message) {
            case "TOKEN_EXPIRED":
                return res.status(401).json({ message: "Access token expired" });
            case "USER_NOT_FOUND":
                return res.status(401).json({ message: "User not found" });
            case "INVALID_TOKEN":
            default:
                return res.status(401).json({ message: "Invalid access token" });
        }
    }
};

export const adminRoute=(req,res,next)=>{
    if(req.user && req.user.role==="admin"){
        next();
    }
    else{
        return res.status(403).json({
            message:"Access denied- Admin only"
        })
    }
}