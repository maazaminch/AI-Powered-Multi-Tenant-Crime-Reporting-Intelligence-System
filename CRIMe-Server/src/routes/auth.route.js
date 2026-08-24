import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import authController from "../controllers/auth and session/auth.controller.js";
import { Roles , UserFlags} from "../constants/roles.js";

const authRouter = express.Router();


authRouter.post(
    "/create-invite-link",
    verifyJWT,
    roleGuard({ roles: [Roles.ADMIN],
        flags: [UserFlags.IS_SUPER_ADMIN] }),
    authController.createInviteLinkController
);


authRouter.post(
    "/register-with-invite-link",
    auditLog('CREATE', 'USER'),
    authController.registerWithInviteController
);

//tested
authRouter.post(
    "/register-citizen",
    auditLog('CREATE', 'USER'),
    authController.registerCitizenController
);





//tested
authRouter.post(
    "/login",
    auditLog('LOGIN', 'AUTH'),
    authController.loginController
);

authRouter.post(
    "/google-login",
    auditLog('LOGIN', 'AUTH'),
    authController.googleLoginController
);

authRouter.post(
    "/google-register-citizen",
    auditLog('CREATE', 'USER'),
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
    authController.refreshAccessTokenController
);

// Revoke refresh token
authRouter.post(
    "/revoke-token",
    verifyJWT,
    authController.revokeRefreshTokenController
);


// Get current user - CRITICAL for frontend auth state
authRouter.get(
    "/me",
    verifyJWT,
    authController.getCurrentUserController
);


export default authRouter;