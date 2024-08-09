import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import cookie from "cookie";
import User from "./models/user.model.js";
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

  socket.on('joinRoom', async ({ roomId, userId }) => {
    const rooms = Array.from(socket.rooms);
    if (!rooms.includes(roomId)) {
      console.log(`Socket ID: ${socket.id} joining room: ${roomId} for user ID: ${userId}`);
      socket.join(roomId);
      const user = await User.findById(socket.user.id);
      io.to(roomId).emit('userJoined', { userId: socket.user.id, name: user.name });

      const joinMessage = new Message({
        user: userId,
        message: "Joined the room.",
        room: roomId
      });
      await joinMessage.save();
      
      const messages = await Message.find({ room: roomId }).populate('user', 'email name');
      socket.emit('initialMessages', messages);

      console.log(`${userId} joined room ${roomId}`);
    }
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
    console.log(`Received sendMessage event for room ${roomId} from user ${userId}`);
    try {
      const newMessage = new Message({
        user: userId,
        message,
        room: roomId,
      });
      await newMessage.save();
      const populatedMessage = await newMessage.populate('user', 'email name');
      io.to(roomId).emit('newMessage', populatedMessage);
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
