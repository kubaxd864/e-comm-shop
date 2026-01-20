import express from "express";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { sessionMiddleware } from "./config/session.js";
import cors from "cors";
import routes from "./routes/index.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(sessionMiddleware);
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use("/api", routes);

export default app;
