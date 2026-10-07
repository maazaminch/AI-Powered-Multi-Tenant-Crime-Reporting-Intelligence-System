import "./src/config/env.js";
import "./src/config/redis.js";

import cloudinary from './src/config/cloudinary.js';

import app from "./app.js";
import connectDB from "./src/config/db.js";
import User from "./src/models/user.model.js";
import { getSessionExpiresAt } from "./src/config/authTokenConfig.js";
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

// Validate Cloudinary configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary configuration. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
  process.exit(1);
}


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: '*', // allow your frontend URL /local
    origin: process.env.CORS_ORIGIN,
    methods: ['GET','POST'],
    credentials: true  //production
  }
});

const getCookieValue = (cookieHeader, name) => {
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookie ? decodeURIComponent(cookie.slice(name.length + 1)) : null;
};

io.use(async (socket, next) => {
  try {
    const accessToken = getCookieValue(
      socket.request.headers.cookie,
      "accessToken"
    );
    if (!accessToken) {
      return next(new Error("Authentication required"));
    }

    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select(
      "status lastLogin refreshTokenExpiresAt +refreshTokenHash"
    );
    const sessionExpiresAt = user && getSessionExpiresAt(user);

    if (
      !user ||
      user.status !== "APPROVED" ||
      !user.refreshTokenHash ||
      !sessionExpiresAt ||
      sessionExpiresAt <= new Date()
    ) {
      return next(new Error("Authentication required"));
    }

    socket.data.userId = user._id.toString();
    socket.data.sessionExpiresAt = sessionExpiresAt.getTime();
    next();
  } catch {
    next(new Error("Authentication required"));
  }
});

// Make io global so NotificationService can emit
global.io = io;

// Socket.IO connection
io.on('connection', (socket) => {
  const sessionTimeRemaining = socket.data.sessionExpiresAt - Date.now();
  const sessionExpiryTimer = setTimeout(() => socket.disconnect(true), sessionTimeRemaining);
  sessionExpiryTimer.unref?.();
  socket.join(`user:${socket.data.userId}`);

  socket.on('disconnect', () => {
    clearTimeout(sessionExpiryTimer);
  });
});

const PORT = process.env.PORT || 8000

const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    });
  } catch (error) {
    console.error("Failed to start server because MongoDB connection failed:", error);
    process.exit(1);
  }
};

startServer();
