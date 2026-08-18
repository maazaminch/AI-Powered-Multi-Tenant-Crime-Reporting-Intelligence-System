import apiError from "../utils/apiError.js";
import wrapAsync from "../utils/wrapAsync.js";
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'


const verifyJWT = wrapAsync(async (req, res, next) => {
    try {

    const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');
    
    // ─────────────── If no access token, try refresh ───────────────
    if (!token) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            return attemptTokenRefresh(req, res, next);
        }
        return next(new apiError(401, "Access token missing."));
    }
    
    
    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // ─────────────── If access token expired, try refresh ───────────────
        if (err.name === 'TokenExpiredError') {
            const refreshToken = req.cookies?.refreshToken;
            if (refreshToken) {
                return attemptTokenRefresh(req, res, next);
            }
            return next(new apiError(401, "Access token expired and no refresh token available."));
        }
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
    }
});

// ─────────────── Helper function to attempt token refresh ───────────────
async function attemptTokenRefresh(req, res, next) {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

        if (!refreshToken) {
            return next(new apiError(401, "Refresh token missing"));
        }
        
        // ─────────────── Find User by Refresh Token ───────────────
        const users = await User.find({
            refreshTokenExpiresAt: { $gt: new Date() }
        }).select('+refreshTokenHash +refreshTokenFamily');
        
        let matchedUser = null;
        for (const user of users) {
            const isMatch = await bcrypt.compare(refreshToken, user.refreshTokenHash);
            
            if (isMatch) {
                matchedUser = user;
                break;
            }
        }

        if (!matchedUser) {
            return next(new apiError(401, "Invalid or expired refresh token"));
        }

        // ─────────────── Check User Status ───────────────
        if (matchedUser.status !== "APPROVED") {
            return next(new apiError(403, "Account not approved"));
        }

        // ─────────────── Token Rotation ───────────────
        const newRefreshToken = crypto.randomBytes(32).toString('hex');
        const newRefreshTokenHash = await bcrypt.hash(newRefreshToken, 10);
        const newRefreshTokenExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        // ─────────────── Update MongoDB ───────────────
        matchedUser.refreshTokenHash = newRefreshTokenHash;
        matchedUser.refreshTokenExpiresAt = newRefreshTokenExpiresAt;
        await matchedUser.save();

        // ─────────────── Generate New Access Token ───────────────
        const newAccessToken = jwt.sign(
            {
                id: matchedUser._id,
                tenantId: matchedUser.tenantId
            },
            process.env.JWT_SECRET,
            { expiresIn: '30m' }
        );

        const cookieOptions = {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        };

        // ─────────────── Set new tokens in request ───────────────
        res.cookie("accessToken", newAccessToken, cookieOptions);
        res.cookie("refreshToken", newRefreshToken, cookieOptions);

        // ─────────────── Set user in request ───────────────
        req.user = await User.findById(matchedUser._id).select("-password");

        next();
    } catch (error) {
        console.error("Token refresh error:", error.message);
        return next(new apiError(401, "Token refresh failed"));
    }
}


export default verifyJWT;