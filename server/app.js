import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import userRouter from './routers/auth.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use('/api', userRouter);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
