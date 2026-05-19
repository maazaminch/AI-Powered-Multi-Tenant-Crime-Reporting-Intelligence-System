import "./src/config/env.js"; 
// import dotenv from "dotenv";
// // dotenv.config();
// import path from "path";
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Configure dotenv with explicit path
// const envPath = path.join(__dirname, '.env');
// console.log('Debug: .env path =', envPath);

// const result = dotenv.config({ path: envPath });
// console.log('Debug: dotenv result =', result);

// console.log('Debug: MONGO_URI =', process.env.MONGO_URI);
// console.log('Debug: EMAIL_USER =', process.env.EMAIL_USER);
// console.log('Debug: All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO') || key.includes('EMAIL')));

import app from "./app.js";
import connectDB from "./src/config/db.js";
import http from 'http';
import { Server } from 'socket.io';


const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // allow your frontend URL
    methods: ['GET','POST']
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
  console.log(`Server running on port http://localhost:${PORT}`) 
    
});


