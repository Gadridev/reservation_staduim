import express from "express";
// import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./shared/errors/errorHandler.js";


const app = express();

// app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Stadium Booking API is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorHandler); // خاص يبقى آخر middleware

export default app;