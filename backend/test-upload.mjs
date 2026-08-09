import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// صورة 1x1 بيكسل صغيرة، bas نتأكدو من upload حقيقي
const tinyPngBase64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";
const buffer = Buffer.from(tinyPngBase64, "base64");

const stream = cloudinary.uploader.upload_stream(
  { folder: "test-uploads" },
  (error, result) => {
    if (error) {
      console.error("UPLOAD FAILED:", error);
    } else {
      console.log("UPLOAD OK:", result.secure_url);
    }
  }
);
stream.end(buffer);
