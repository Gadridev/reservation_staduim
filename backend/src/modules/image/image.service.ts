import mongoose from "mongoose";
import { Image } from "./image.model.js";
import { Stadium } from "../stadium/stadium.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import { uploadBuffer, deleteAsset } from "./image.cloudinary.js";
import { DEFAULT_STADIUM_IMAGES } from "../../shared/constants/defaultStadiumImages.js";
import { IMAGE_RULES } from "../../shared/constants/imageRules.js";

async function findOwnedStadiumOrThrow(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId
) {
  if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
    throw new AppError("Stadium not found", 404);
  }

  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  if (stadium.ownerId.toString() !== ownerId.toString()) {
    throw new AppError("You do not have permission to manage images for this stadium", 403);
  }

  return stadium;
}

export async function uploadStadiumImage(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId,
  file: Express.Multer.File
) {
  const stadium = await findOwnedStadiumOrThrow(stadiumId, ownerId);

  const existingCount = await Image.countDocuments({ stadiumId: stadium._id });

  if (existingCount >= IMAGE_RULES.MAX_IMAGES_PER_STADIUM) {
    throw new AppError(
      `A stadium can have a maximum of ${IMAGE_RULES.MAX_IMAGES_PER_STADIUM} images`,
      409
    );
  }

  const uploadResult = await uploadBuffer(file.buffer, `stadiums/${stadium._id}`);

  try {
    const image = await Image.create({
      stadiumId: stadium._id,
      url: uploadResult.secureUrl,
      publicId: uploadResult.publicId,
      isPrimary: existingCount === 0, // أول صورة حقيقية = primary تلقائيا
    });

    return image;
  } catch (err) {
    // Cloudinary نجح، MongoDB فشل → نمسحو الـ asset اليتيم
    await deleteAsset(uploadResult.publicId).catch(() => {});
    throw err;
  }
}

export async function getStadiumImages(stadiumId: string) {
  if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
    throw new AppError("Stadium not found", 404);
  }

  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  const images = await Image.find({ stadiumId: stadium._id }).sort({
    isPrimary: -1,
    createdAt: 1,
  });

  if (images.length === 0) {
    return {
      images: DEFAULT_STADIUM_IMAGES.map((url) => ({ url, isDefault: true })),
      isDefault: true,
    };
  }

  return {
    images: images.map((img) => ({
      id: img._id,
      url: img.url,
      isPrimary: img.isPrimary,
      isDefault: false,
    })),
    isDefault: false,
  };
}

export async function setPrimaryImage(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId,
  imageId: string
) {
  const stadium = await findOwnedStadiumOrThrow(stadiumId, ownerId);

  if (!mongoose.Types.ObjectId.isValid(imageId)) {
    throw new AppError("Image not found", 404);
  }

  const image = await Image.findById(imageId);

  if (!image || image.stadiumId.toString() !== stadium._id.toString()) {
    throw new AppError("Image not found", 404);
  }

  await Image.updateMany(
    { stadiumId: stadium._id, _id: { $ne: image._id } },
    { $set: { isPrimary: false } }
  );

  image.isPrimary = true;
  await image.save();

  return image;
}

export async function deleteStadiumImage(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId,
  imageId: string
) {
  const stadium = await findOwnedStadiumOrThrow(stadiumId, ownerId);

  if (!mongoose.Types.ObjectId.isValid(imageId)) {
    throw new AppError("Image not found", 404);
  }

  const image = await Image.findById(imageId);

  if (!image || image.stadiumId.toString() !== stadium._id.toString()) {
    throw new AppError("Image not found", 404);
  }

  const wasPrimary = image.isPrimary;

  await deleteAsset(image.publicId);
  await image.deleteOne();

  if (wasPrimary) {
    const nextImage = await Image.findOne({ stadiumId: stadium._id }).sort({ createdAt: 1 });
    if (nextImage) {
      nextImage.isPrimary = true;
      await nextImage.save();
    }
  }
}