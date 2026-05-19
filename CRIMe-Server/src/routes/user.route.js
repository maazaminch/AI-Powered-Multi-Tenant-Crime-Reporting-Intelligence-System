import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import userController from "../controllers/user management/user.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";

const userRouter = express.Router();

//tested
userRouter.post(
    '/update-user-status/:userId',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    userController.updateUserStatus
);


userRouter.get(
    "/search-users",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN, Roles.POLICE], 
        flags: [UserFlags.IS_SUPER_ADMIN] }),
    userController.searchUserController
);

userRouter.delete(
    "/delete-user/:id",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    userController.deleteUserController
);


export default userRouter;
