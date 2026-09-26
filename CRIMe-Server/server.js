import "./src/config/env.js";
import "./src/config/redis.js";

import cloudinary from './src/config/cloudinary.js';

import app from "./app.js";
import connectDB from "./src/config/db.js";
import http from 'http';
import { Server } from 'socket.io';

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

// Connect to database after environment variables are loaded
connectDB();

// Make io global so NotificationService can emit
global.io = io;

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room for this user to receive notifications
  socket.on('join', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined room ${userId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 8000
server.listen(PORT, () => {
  // console.log(`Server running on port http://localhost:${PORT}`) 
  console.log(`Server running on port ${PORT}`)
});


