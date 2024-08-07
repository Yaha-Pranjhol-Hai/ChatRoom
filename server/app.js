import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import Message from "./models/message.model.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fetchuser from "./middleware/fetchuser.js";
import userRouter from './routers/auth.js';
import chatRouter from './routers/chat.js';
import roomRouter from './routers/room.js';
import validateTokenRouter from './routers/validatetoken.js';

dotenv.config({
  path: "./.env",
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true,
  })
);

io.use((socket, next) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || ''); // Parse cookies
  const token = cookies.authToken; // Access authToken

  // console.log(socket.handshake);

  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.user = user.user;
    next();
  });
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id} - User ID: ${socket.user.id}`);

  socket.on('joinRoom', async ({ roomId, userId }) => {
    console.log(`Socket ID: ${socket.id} joining room: ${roomId} for user ID: ${userId}`);
    socket.join(roomId);
    io.to(roomId).emit('userJoined', { userId });

    const joinMessage = new Message({
      user: userId,
      message: "Joined the room.",
      room: roomId
    });
    await joinMessage.save();
  
    const messages = await Message.find({ room: roomId }).populate('user', 'email');
    socket.emit('initialMessages', messages);

    console.log(`${socket.user.id} joined room ${roomId}`);
  });

  socket.on('fetchChats', async (callback) => {
    try {
      const chats = await Message.find({ user: socket.user.id });
      callback({ success: true, chats });
    } catch (error) {
      callback({ success: false, error: error.message });
    }
  });

  socket.on('sendMessage', async ({ message, roomId, userId }, callback) => {
    try {
      const newMessage = new Message({
        user: userId,
        message,
        room: roomId,
      });
      await newMessage.save();
      io.to(roomId).emit('newMessage', newMessage);
      callback({ success: true });
    } catch (error) {
      console.error('Failed to send message:', error);
      callback({ success: false, error: error.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.user.id);
  });
});

app.use('/api', userRouter);
app.use('/api', validateTokenRouter);
app.use('/api/rooms', fetchuser, roomRouter);
app.use('/api/chats', fetchuser, chatRouter);

export default server;
