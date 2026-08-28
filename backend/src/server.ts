import dotenv from "dotenv";
dotenv.config();

import { createServer } from "http";
import app from "./app.js";
import { connectDB } from "./database/connection.js";
import {
  startBookingCompletionScheduler,
  stopBookingCompletionScheduler,
} from "./modules/booking/booking.scheduler.js";
import { initializeSocketServer } from "./socket/socket.server.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const httpServer = createServer(app);
  const io = initializeSocketServer(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  startBookingCompletionScheduler();

  const shutdown = () => {
    console.log("Shutting down gracefully...");
    stopBookingCompletionScheduler();
    io.close(() => {
      console.log("Server closed");
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

startServer();