import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import userRouter from './routers/auth.js';
import cookieParser from "cookie-parser";
import Message from "./models/message.model.js";
import jwt from "jsonwebtoken";


const app = express();
const server = http.createServer(app);
app.use(cookieParser());


const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN ||"http://localhost:3000", // Adjust this to your frontend URL
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(
    cors({
      origin:  process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    })
  );

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
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
  console.log('A user connected', socket.user.id);

  socket.on('fetchChats', async (callback) => {
    try {
      const chats = await Message.find({ user: socket.user.id});
      callback({ success: true, chats});
    } catch (error) {
      callback({ success: false, error: error.message})
    }
  });

  socket.on('sendMessage', async (message, callback) => {
    try {
      const chat = new Message( {
        user: socket.user.id,
        message
      });
      await chat.save();

      io.emit('newMessage', chat);
      callback({ success: true, chat});

    } catch (error) {
      callback({ success: false, error: error.massage})
    }
  })

  socket.on('disconnect', () => {
    console.log('User Disconnected', socket.user.id);
  })
})

app.use(express.json());
app.use('/api', userRouter);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
