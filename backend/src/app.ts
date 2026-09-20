import express from "express";
import swaggerUi from "swagger-ui-express";
// import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import { errorHandler } from "./shared/errors/errorHandler.js";
import stadiumRoutes from "./modules/stadium/stadium.routes.js";
import bookingRoutes from "./modules/booking/booking.routes.js";
import reviewRoutes from "./modules/review/review.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";


import { swaggerSpec } from "./config/swagger.js";
import imageRoutes from "./modules/image/image.routes.js";

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
app.use("/api/reviews", reviewRoutes);
app.use("/api/stadiums/:stadiumId/images", imageRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

export default app;
