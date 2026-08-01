import { DEFAULT_WORKING_HOURS } from "../../shared/constants/defaultWorkingHours.js";
import { AppError } from "../../shared/errors/AppError.js";
import { Stadium } from "./stadium.model.js";
import type { CreateStadiumInput, UpdateStadiumInput } from "./stadium.validation.js";
import type { UpdateWorkingHoursInput } from "./stadium.validation.js";
import type mongoose from "mongoose";
// import mongoose from "mongoose"

export async function createStadium(
  ownerId: mongoose.Types.ObjectId,
  input: CreateStadiumInput,
) {
  const existingStadium = await Stadium.findOne({
    ownerId,
    name: input.name,
    "location.address": input.location.address,
    "location.city": input.location.city,
    isActive: true,
  });

  if (existingStadium) {
    throw new AppError(
      "You already have a stadium with the same name and location",
      409,
    );
  }
  const stadium = await Stadium.create({
    ownerId,
    name: input.name,
    description: input.description,
    location: input.location,
    images: input.images,
    amenities: input.amenities,
    pricePerHour: input.pricePerHour,
  });

  return stadium;
}
export async function getPublicStadiums() {
  const stadiums = await Stadium.find({ isActive: true }).sort({ createdAt: -1 });
  return stadiums;
}

export async function getStadiumById(id: string) {
  const stadium = await Stadium.findOne({ _id: id, isActive: true });

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  return stadium;
}
export async function getMyStadiums(ownerId: mongoose.Types.ObjectId) {
  const stadiums = await Stadium.find({ ownerId }).sort({ createdAt: -1 });
  return stadiums;
}
export async function updateStadium(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId,
  input: UpdateStadiumInput
) {
  // if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
  //   throw new AppError("Stadium not found", 404);
  // }

  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  if (stadium.ownerId.toString() !== ownerId.toString()) {
    throw new AppError("You do not have permission to update this stadium", 403);
  }

  if (input.name !== undefined) stadium.name = input.name;
  if (input.description !== undefined) stadium.description = input.description;
  if (input.location !== undefined) stadium.location = input.location;
  if (input.images !== undefined) stadium.images = input.images;
  if (input.amenities !== undefined) stadium.amenities = input.amenities;
  if (input.pricePerHour !== undefined) stadium.pricePerHour = input.pricePerHour;

  await stadium.save();

  return stadium;
}
export async function deactivateStadium(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId
) {
  // if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
  //   throw new AppError("Stadium not found", 404);
  // }

  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  if (stadium.ownerId.toString() !== ownerId.toString()) {
    throw new AppError("You do not have permission to deactivate this stadium", 403);
  }

  stadium.isActive = false;
  await stadium.save();

  return stadium;
}

export async function getWorkingHours(stadiumId: string) {
  const stadium = await Stadium.findOne({ _id: stadiumId, isActive: true }).select(
    "workingHours"
  );

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  return stadium.workingHours;
}

export async function updateWorkingHours(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId,
  input: UpdateWorkingHoursInput
) {
  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  if (stadium.ownerId.toString() !== ownerId.toString()) {
    throw new AppError("You do not have permission to update this stadium's working hours", 403);
  }

  const sortedWorkingHours = [...input].sort((a, b) => a.dayOfWeek - b.dayOfWeek);

  stadium.workingHours = sortedWorkingHours;
  await stadium.save();

  return stadium.workingHours;
}