import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import multer from "multer";
import authController from "../controllers/auth and session/auth.controller.js";
import { Roles } from "../constants/roles.js";
import {
    createInviteLinkSchema
} from "../validations/invite.schema.js";
import {
    registerCitizenSchema,
    registerWithInviteSchema,
    loginSchema,
    googleLoginSchema,
    googleRegisterCitizenSchema,
    refreshTokenSchema,
    revokeTokenSchema
} from "../validations/auth.schema.js";

const authRouter = express.Router();

// Multer config for memory storage (no temp files)
const upload = multer({ storage: multer.memoryStorage() });


authRouter.post(
    "/create-invite-link",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    validate(createInviteLinkSchema),
    authController.createInviteLinkController
);


authRouter.post(
    "/register-with-invite-link",
    validate(registerWithInviteSchema),
    auditLog('REGISTER_WITH_INVITE', 'USER'),
    authController.registerWithInviteController
);

//tested
authRouter.post(
    "/register-citizen",
    validate(registerCitizenSchema),
    auditLog('REGISTER', 'USER'),
    authController.registerCitizenController
);




//tested
authRouter.post(
    "/login",
    validate(loginSchema),
    auditLog('LOGIN', 'AUTH'),
    authController.loginController
);

authRouter.post(
    "/google-login",
    validate(googleLoginSchema),
    auditLog('LOGIN', 'AUTH'),
    authController.googleLoginController
);

authRouter.post(
    "/google-register-citizen",
    validate(googleRegisterCitizenSchema),
    auditLog('GOOGLE_REGISTER', 'USER'),
    authController.googleRegisterCitizenController
);

//tested
authRouter.post(
    "/logout",
    verifyJWT,
    auditLog('LOGOUT', 'AUTH'),
    authController.logoutController
);

// Refresh access token
authRouter.post(
    "/refresh-token",
    validate(refreshTokenSchema),
    authController.refreshAccessTokenController
);

// Revoke refresh token
authRouter.post(
    "/revoke-token",
    verifyJWT,
    validate(revokeTokenSchema),
    authController.revokeRefreshTokenController
);


// Get current user - CRITICAL for frontend auth state
authRouter.get(
    "/me",
    verifyJWT,
    authController.getCurrentUserController
);

// Upload profile picture (no auth required for registration)
authRouter.post(
    "/upload-profile-picture",
    upload.single('profilePicture'),
    authController.uploadProfilePictureController
);

authRouter.post(
    "/profile-picture",
    verifyJWT,
    upload.single('profilePicture'),
    authController.uploadProfilePictureController
);


export default authRouter;
