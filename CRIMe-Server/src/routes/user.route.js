import express from "express";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import auditLog from "../middlewares/auditLog.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import userController from "../controllers/user management/user.controller.js";
import { Roles, UserFlags } from "../constants/roles.js";
import { updateProfileSchema, changePasswordSchema } from "../validations/user.schema.js";

const userRouter = express.Router();

// Get users for dropdown (tenant-specific for admin, all for superadmin)
userRouter.get(
    "/get-users",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN] }),
    userController.getUsers
);

// Update user profile (name, profile pic, gender, date of birth, address, national id)
// Only citizens can change email
userRouter.put(
    "/update-profile",
    verifyJWT,
    // validate(updateProfileSchema),
    auditLog('UPDATE', 'USER'),
    userController.updateProfile
);

// Change password
userRouter.put(
    "/change-password",
    verifyJWT,
    // validate(changePasswordSchema),
    auditLog('UPDATE', 'USER'),
    userController.changePassword
);

//tested
userRouter.post(
    '/update-user-status/:userId',
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    auditLog('UPDATE', 'USER'),
    userController.updateUserStatus
);

userRouter.delete(
    "/delete-user/:id",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN], flags: [UserFlags.IS_SUPER_ADMIN] }),
    auditLog('DELETE', 'USER'),
    userController.deleteUserController
);


export default userRouter;
