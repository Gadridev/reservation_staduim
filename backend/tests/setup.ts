import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

beforeAll(async () => {
  const uri = process.env.MONGODB_URI_TEST;

  if (!uri) {
    throw new Error("MONGODB_URI_TEST is not defined in environment variables");
  }

  await mongoose.connect(uri);
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key]?.deleteMany({});
  }
});

afterAll(async () => {
  await mongoose.connection.close();
});