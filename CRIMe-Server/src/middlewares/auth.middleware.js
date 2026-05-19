
import apiError from "../utils/apiError.js";
import wrapAsync from "../utils/wrapAsync.js";
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'


const verifyJWT = wrapAsync(async (req, res, next) => {
    try {


    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return next(new apiError(401, "Access token missing."));
    }
    

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return next(new apiError(401, "Invalid or expired token."));
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
        return next(new apiError(401, "Unauthorized user."));
    }

    req.user = user;
    next();
}
    catch (error) {
        console.error("JWT Error:", error.message);
        next(error);
        throw new apiError(400, "Invalid access token");
        
    }
});


export default verifyJWT;