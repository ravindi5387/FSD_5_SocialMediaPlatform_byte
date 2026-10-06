import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { authRoutes } from "./routes/authRoutes.js";
import { postRoutes } from "./routes/postRoutes.js";
import { profileRoutes } from "./routes/profileRoutes.js";
import { notificationRoutes } from "./routes/notificationRoutes.js";

export const app = express();

const allowedOrigins = new Set([
  env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
]);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(
        new Error("Origin is not allowed by Connectly CORS policy"),
      );
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "6mb" }));

app.get("/api/health", (_req, res) =>
  res.json({ status: "ok", service: "connectly-api" }),
);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((_req, res) => res.status(404).json({ message: "Route not found" }));
app.use(
  (
    error: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  },
);

export default app;
