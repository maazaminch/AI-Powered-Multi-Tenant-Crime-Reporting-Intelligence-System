import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import errorHandler from "./src/middlewares/errorHandler.middleware.js";
import cookieParser from 'cookie-parser'


import publicRoutes from "./src/routes/public.route.js";
import superAdminRoutes from "./src/routes/superAdmin.route.js";
import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import stationHeadRoutes from "./src/routes/stationHead.route.js";
import policeRoutes from "./src/routes/police.route.js";  
import uploadRoutes from "./src/routes/upload.route.js";
import notificationRoutes from "./src/routes/notification.route.js";
import citizenRoutes from "./src/routes/citizen.route.js";
import locationRoutes from "./src/routes/location.route.js";
import evidenceRoutes from "./src/routes/evidence.route.js";
import healthRoutes from "./src/routes/health.route.js";
import auditRoutes from "./src/routes/audit.route.js";
import pdfRoutes from "./src/routes/pdf.route.js";



const app = express();


// Sets secure HTTP response headers that browsers respect to prevent common attacks:
// Prevents clickjacking (site being embedded in a malicious iframe)
// Stops MIME-sniffing attacks
// Removes the X-Powered-By: Express header (don't advertise your stack to attackers)
// Sets Content-Security-Policy, HSTS, and other protective headers
app.use(helmet()); // sets secure HTTP headers



app.use(cors({ 
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

//using req.cookis in jwt for access token because its coming from cookies
app.use(cookieParser())

// General protection — all routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(generalLimiter);



// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/superAdmin", superAdminRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/station-head", stationHeadRoutes);
app.use("/api/police", policeRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/citizen", citizenRoutes);
app.use("/api/v1/location", locationRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/pdf", pdfRoutes);

//GLOBAL ERROR HANDLER (must be **after** all routes)
app.use(errorHandler);


export default app;