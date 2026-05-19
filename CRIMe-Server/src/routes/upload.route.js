
import express from "express";
import UploadController from "../controllers/utilities/upload.controller.js";
import verifyJWT from "../middlewares/auth.middleware.js";
import tenantGuard from "../middlewares/tenantGuard.middleware.js";
import roleGuard from "../middlewares/roleGuard.middleware.js";
import { Roles } from "../constants/roles.js";

const router = express.Router();

//key idea its just a helper route
// The upload route is not something the user sees or uses directly in the UI.
// It’s just a helper route for the frontend to get a presigned URL from the backend.
// Frontend uses that URL to upload files directly to S3.
// Once the file is uploaded, the URL is sent to the registration API (or evidence API) to store in the database.
// Profile pic for registration (public) or profile update (logged-in)

// Public profile upload for citizen registration (no auth required)
router.post(
    "/profile-url-public",
    UploadController.getPublicProfileUploadUrl);

router.post(
    "/profile-url",
    verifyJWT, 
    tenantGuard,
    roleGuard({ roles: [Roles.ADMIN, Roles.POLICE, Roles.CITIZEN] }),
    UploadController.getUploadUrl);

// Evidence upload (logged-in)
router.post(
    "/evidence-url", 
    verifyJWT,
    tenantGuard,
    roleGuard({ roles: [Roles.POLICE, Roles.CITIZEN] }),
    UploadController.getUploadUrl);

export default router;
