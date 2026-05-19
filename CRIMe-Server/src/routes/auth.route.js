import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
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
    authController.registerWithInviteController
);

//tested
authRouter.post(
    "/register-citizen",
    authController.registerCitizenController
);

//tested
authRouter.put(
    '/update-user-details',
    verifyJWT,
    tenantGuard,
    roleGuard(Roles.CITIZEN, Roles.POLICE, Roles.ADMIN),
    authController.updateUserDetailsController
)



//tested
authRouter.post(
    "/login",
    authController.loginController
);

// Get current user - CRITICAL for frontend auth state
authRouter.get(
    "/me",
    verifyJWT,
    authController.getCurrentUserController
);

//tested
authRouter.post(
    "/logout",
    authController.logoutController
);

export default authRouter;