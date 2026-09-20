import dotenv from "dotenv";
import { createServer } from "http";
import mongoose from "mongoose";
import app from "../src/app.js";
import { initializeSocketServer } from "../src/socket/socket.server.js";
import type { AppServer } from "../src/socket/socket.types.js";

dotenv.config();

let testIO: AppServer;
beforeAll(async () => {
  const uri = process.env.MONGODB_URI_TEST;

  if (!uri) {
    throw new Error("MONGODB_URI_TEST is not defined in environment variables");
  }

  await mongoose.connect(uri);
  testIO = initializeSocketServer(createServer(app));
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]?.deleteMany({});
  }
});

afterAll(async () => {
  testIO?.close();
  await mongoose.connection.close();
});
