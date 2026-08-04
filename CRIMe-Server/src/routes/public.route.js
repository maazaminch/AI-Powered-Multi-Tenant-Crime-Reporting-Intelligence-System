// public.route.js
import { Router } from "express";
import PublicController from "../controllers/public/public.controller.js";
import rateLimit from "express-rate-limit";

const publicRouter = Router();

const otpLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const reportLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
const trackLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });
const stationLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 20 });

publicRouter.post("/send-otp", otpLimiter, PublicController.sendOTP);
publicRouter.post("/verify-otp", otpLimiter, PublicController.verifyOTP);
publicRouter.post("/report-case", reportLimiter, PublicController.reportCase);
publicRouter.get("/track-case", trackLimiter, PublicController.trackCase);
publicRouter.get("/case-details", trackLimiter, PublicController.caseDetails);
publicRouter.get("/case-updates", trackLimiter, PublicController.caseUpdates);
publicRouter.post("/add-note", reportLimiter, PublicController.addNote);
publicRouter.post("/upload-evidence", reportLimiter, PublicController.uploadEvidence);
publicRouter.get("/suggest-nearest-stations", stationLimiter, PublicController.suggestNearestStations);

export default publicRouter;