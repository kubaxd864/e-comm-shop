import { Server } from "socket.io";
import sharedSession from "express-socket.io-session";
import { sessionMiddleware } from "./session.js";
import { chatController } from "../controllers/socket.controller.js";
import dotenv from "dotenv";
dotenv.config();

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.use(sharedSession(sessionMiddleware, { autoSave: true }));
  chatController(io);
  return io;
}
