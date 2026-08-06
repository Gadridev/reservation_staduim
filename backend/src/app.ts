import express from "express";
import swaggerUi from "swagger-ui-express";
// import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./shared/errors/errorHandler.js";
import stadiumRoutes from "./modules/stadium/stadium.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

// app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Stadium Booking API is running",
  });
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/docs/", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use("/api/auth", authRoutes);
app.use("/api/stadiums", stadiumRoutes);
app.use("/api/bookings", bookingRoutes);

app.use(errorHandler);

export default app;