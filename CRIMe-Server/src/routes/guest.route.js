// public.route.js
import { Router } from "express";
import GuestController from "../controllers/guest/guest.controller.js";
import rateLimit from "express-rate-limit";
import auditLog from '../middlewares/auditLog.middleware.js';

const guestRouter = Router();

const otpLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const reportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
const trackLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const stationLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });

guestRouter.post(
    "/send-otp", 
    otpLimiter, 
    GuestController.sendOTP
);

guestRouter.post("/verify-otp", otpLimiter, GuestController.verifyOTP);

guestRouter.post(
    "/report-case", 
    reportLimiter,    
    auditLog('GUEST_REPORT', 'CASE'), 
    GuestController.reportCase
);

guestRouter.get(
    "/track-case/:caseId", 
    trackLimiter,
    auditLog('GUEST_TRACK', 'CASE'), 
    GuestController.trackCase
);
guestRouter.get(
    "/case-details/:caseId", 
    trackLimiter, 
    GuestController.caseDetails
);

guestRouter.get(
    "/case-updates/:caseId", 
    trackLimiter, 
    GuestController.caseUpdates
);

guestRouter.post(
    "/add-note/:caseId", 
    reportLimiter, 
    auditLog('ADD', 'CASE_UPDATE'), 
    GuestController.addNote
);

guestRouter.get(
    "/suggest-nearest-stations", 
    stationLimiter, 
    GuestController.suggestNearestStations
);

export default guestRouter;
