import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
}

export function uploadBuffer(
  buffer: Buffer,
  folder: string,
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "image"
      },
      (error, result) => {
        if (error || !result) {
          console.error("Cloudinary upload error:", error);
          return reject(error ?? new Error("Cloudinary upload failed"));
        }
        resolve({ secureUrl: result.secure_url, publicId: result.public_id });
      },
    );
    stream.end(buffer);
  });
}

export function deleteAsset(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error: unknown) => {
      if (error) return reject(error);
      resolve();
    });
  });
}
