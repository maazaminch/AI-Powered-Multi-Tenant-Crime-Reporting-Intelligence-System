// public.route.js
import { Router } from "express";
import GuestController from "../controllers/guest/guest.controller.js";
import rateLimit from "express-rate-limit";

const guestRouter = Router();

const otpLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const reportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
const trackLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const stationLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });

guestRouter.post("/send-otp", otpLimiter, GuestController.sendOTP);
guestRouter.post("/verify-otp", otpLimiter, GuestController.verifyOTP);
guestRouter.post("/report-case", reportLimiter, GuestController.reportCase);
guestRouter.get("/track-case", trackLimiter, GuestController.trackCase);
guestRouter.get("/case-details", trackLimiter, GuestController.caseDetails);
guestRouter.get("/case-updates", trackLimiter, GuestController.caseUpdates);
guestRouter.post("/add-note", reportLimiter, GuestController.addNote);
guestRouter.post("/upload-evidence", reportLimiter, GuestController.uploadEvidence);
guestRouter.get("/suggest-nearest-stations", stationLimiter, GuestController.suggestNearestStations);

export default guestRouter;