import apiError from "../utils/apiError.js";
import wrapAsync from "../utils/wrapAsync.js";
import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import bcrypt from 'bcrypt'
import {
    ACCESS_TOKEN_TTL,
    ACCESS_TOKEN_TTL_MS,
    getSessionExpiresAt
} from '../config/authTokenConfig.js'


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

    const sessionExpiresAt = getSessionExpiresAt(user);
    if (!sessionExpiresAt || sessionExpiresAt <= new Date()) {
        return next(new apiError(401, "Session expired."));
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

        const separatorIndex = refreshToken.indexOf(".");
        if (separatorIndex === -1) {
            return next(new apiError(401, "Invalid refresh token"));
        }

        const refreshTokenId = refreshToken.slice(0, separatorIndex);
        const refreshTokenSecret = refreshToken.slice(separatorIndex + 1);
        if (!refreshTokenId || !refreshTokenSecret) {
            return next(new apiError(401, "Invalid refresh token"));
        }

        const user = await User.findOne({ refreshTokenId })
            .select("+refreshTokenHash");

        if (!user || !user.refreshTokenHash) {
            return next(new apiError(401, "Invalid or expired refresh token"));
        }

        const sessionExpiresAt = getSessionExpiresAt(user);
        if (!sessionExpiresAt || sessionExpiresAt <= new Date()) {
            return next(new apiError(401, "Invalid or expired refresh token"));
        }

        const isMatch = await bcrypt.compare(
            refreshTokenSecret,
            user.refreshTokenHash
        );
        if (!isMatch) {
            return next(new apiError(401, "Invalid or expired refresh token"));
        }

        if (user.status !== "APPROVED") {
            return next(new apiError(403, "Account not approved"));
        }

        const newAccessToken = jwt.sign(
            {
                id: user._id,
                tenantId: user.tenantId
            },
            process.env.JWT_SECRET,
            { expiresIn: ACCESS_TOKEN_TTL }
        );

        const accessCookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
            maxAge: ACCESS_TOKEN_TTL_MS
        };

        res.cookie("accessToken", newAccessToken, accessCookieOptions);

        req.user = await User.findById(user._id).select("-password");

        next();
    } catch (error) {
        return next(error);
    }
}


export default verifyJWT;