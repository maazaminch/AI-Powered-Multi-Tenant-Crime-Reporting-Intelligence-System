import express from "express";
import cors from "cors";

import errorHandler from "./src/middlewares/errorHandler.middleware.js";
import cookieParser from 'cookie-parser'

// import helmet from "helmet";
// import rateLimit from "express-rate-limit";
//import mapRoutes from "./src/routes/map.route.js";
import superAdminRoutes from "./src/routes/superAdmin.route.js";
import authRoutes from "./src/routes/auth.route.js";
import userRoutes from "./src/routes/user.route.js";
import caseRoutes from "./src/routes/case.route.js";
import adminRoutes from "./src/routes/admin.route.js";
import uploadRoutes from "./src/routes/upload.route.js";
import notificationRoutes from "./src/routes/notification.route.js";



const app = express();
// Security middlewares
//app.use(helmet()); // sets secure HTTP headers
app.use(cors({ 
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

//using req.cookis in jwt for access token because its coming from cookies
app.use(cookieParser())


// Rate limiting to prevent brute-force attacks
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 min
//   max: 100, // limit each IP to 100 requests per window
// });
// app.use(limiter);


//app.use(cookieParser());


// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/superAdmin", superAdminRoutes);
// app.use("/api/maps", mapRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/uploads", uploadRoutes);
app.use("/api/notifications", notificationRoutes);

//GLOBAL ERROR HANDLER (must be **after** all routes)
app.use(errorHandler);


export default app;