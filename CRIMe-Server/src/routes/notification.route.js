import express from "express";

import NotificationController from "../controllers/utilities/notification.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import { Roles, UserFlags } from "../constants/roles.js";

const notificationRouter = express.Router();

notificationRouter.get(
    "/fetch-notifications",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN],
        flags: [UserFlags.IS_SUPER_ADMIN, UserFlags.IS_STATION_HEAD]
     }),
    NotificationController.fetchUserNotifications
)


notificationRouter.get(
    "/fetch-header-notifications",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN],
        flags: [UserFlags.IS_SUPER_ADMIN, UserFlags.IS_STATION_HEAD]
     }),
    NotificationController.fetchUserNotificationsForHeader
)

notificationRouter.patch(
    "/mark-as-read/:notificationId",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN],
        flags: [UserFlags.IS_SUPER_ADMIN, UserFlags.IS_STATION_HEAD]
     }),
    NotificationController.markAsRead
)

notificationRouter.get(
    "/unread-count",
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.CITIZEN, Roles.POLICE, Roles.ADMIN],
        flags: [UserFlags.IS_SUPER_ADMIN, UserFlags.IS_STATION_HEAD]
     }),
    NotificationController.unreadCount
)

export default notificationRouter;