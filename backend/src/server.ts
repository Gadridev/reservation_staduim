import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDB } from "./database/connection.js";

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();