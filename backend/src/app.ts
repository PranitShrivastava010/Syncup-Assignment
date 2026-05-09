import "dotenv/config";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import routes from "./routes";
import { errorHandler } from "./middlewares/error.middleware";

const app = express();

const defaultAllowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
];

const configuredOrigins = (process.env.FRONTEND_ORIGINS ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...configuredOrigins,
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(path.resolve(process.cwd(), "uploads")));

app.get("/", (_req, res) => {
  res.json({ status: "Syncup_backend running" });
});

app.use("/api", routes);
app.use(errorHandler);

export default app;
