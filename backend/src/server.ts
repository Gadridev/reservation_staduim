import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./database/connection.js";
import {
  startBookingCompletionScheduler,
  stopBookingCompletionScheduler,
} from "./modules/booking/booking.scheduler.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  startBookingCompletionScheduler();

  const shutdown = () => {
    console.log("Shutting down gracefully...");
    stopBookingCompletionScheduler();
    server.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();
