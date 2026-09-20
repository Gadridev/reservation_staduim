import { Aggregate } from "mongoose";
import { DEFAULT_STADIUM_IMAGES } from "../../shared/constants/defaultStadiumImages.js";
import { AppError } from "../../shared/errors/AppError.js";
import { Booking } from "../booking/booking.model.js";
import { Stadium } from "./stadium.model.js";
import type {
  CreateStadiumInput,
  UpdateStadiumInput,
} from "./stadium.validation.js";
import type { UpdateWorkingHoursInput } from "./stadium.validation.js";
import * as mongoose from "mongoose";

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
  const stadiums = await Stadium.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: "images",
        let: { stadiumId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$stadiumId", "$$stadiumId"] },
                  { $eq: ["$isPrimary", true] },
                ],
              },
            },
          },
          { $limit: 1 },
        ],
        as: "primaryImage",
      },
    },
    {
      $addFields: {
        primaryImageUrl: {
          $ifNull: [
            { $arrayElemAt: ["$primaryImage.url", 0] },
            DEFAULT_STADIUM_IMAGES[0],
          ],
        },
      },
    },
    { $project: { primaryImage: 0 } },
  ]);
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
  input: UpdateStadiumInput,
) {
  // if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
  //   throw new AppError("Stadium not found", 404);
  // }

  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  if (stadium.ownerId.toString() !== ownerId.toString()) {
    throw new AppError(
      "You do not have permission to update this stadium",
      403,
    );
  }

  if (input.name !== undefined) stadium.name = input.name;
  if (input.description !== undefined) stadium.description = input.description;
  if (input.location !== undefined) stadium.location = input.location;
  if (input.images !== undefined) stadium.images = input.images;
  if (input.amenities !== undefined) stadium.amenities = input.amenities;
  if (input.pricePerHour !== undefined)
    stadium.pricePerHour = input.pricePerHour;

  await stadium.save();

  return stadium;
}
export async function deactivateStadium(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId,
) {
  // if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
  //   throw new AppError("Stadium not found", 404);
  // }

  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  if (stadium.ownerId.toString() !== ownerId.toString()) {
    throw new AppError(
      "You do not have permission to deactivate this stadium",
      403,
    );
  }

  stadium.isActive = false;
  await stadium.save();

  return stadium;
}

export async function getWorkingHours(stadiumId: string) {
  const stadium = await Stadium.findOne({
    _id: stadiumId,
    isActive: true,
  }).select("workingHours");

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  return stadium.workingHours;
}

export async function updateWorkingHours(
  stadiumId: string,
  ownerId: mongoose.Types.ObjectId,
  input: UpdateWorkingHoursInput,
) {
  const stadium = await Stadium.findById(stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  if (stadium.ownerId.toString() !== ownerId.toString()) {
    throw new AppError(
      "You do not have permission to update this stadium's working hours",
      403,
    );
  }

  const sortedWorkingHours = [...input].sort(
    (a, b) => a.dayOfWeek - b.dayOfWeek,
  );

  stadium.workingHours = sortedWorkingHours;
  await stadium.save();

  return stadium.workingHours;
}
export const getStadiumBookingsAvailablity = async (
  stadiumId: string,
  date: string,
) => {
  if (!mongoose.Types.ObjectId.isValid(stadiumId)) {
    throw new AppError("Stadium id is invalid", 400);
  }
  const stadium = await Stadium.findOne({ _id: stadiumId, isActive: true });
  const requestDay = new Date(date);
  const dayOfWeek = requestDay.getDay(); // 0 (Sunday) to 6 (Saturday)
  const dayRequested = stadium?.workingHours.find(
    (day) => day.dayOfWeek === dayOfWeek,
  );
  const [openTime, openMinute] = dayRequested?.openTime
    ?.split(":")
    .map(Number) || [0, 0];
  const [closeTime, closeMinute] = dayRequested?.closeTime
    ?.split(":")
    .map(Number) || [0, 0];

  let cursor = new Date(requestDay);
  cursor.setHours(openTime as number, openMinute, 0, 0);
  let endCursor = new Date(requestDay);
  endCursor.setHours(closeTime as number, closeMinute, 0, 0);
  const availableSlots: { startTime: Date; endTime: Date }[] = [];
  while (cursor < endCursor) {
    //start of slote
    const startTime = cursor;
    const endTime = cursor.getTime() + 60 * 60 * 1000; // Add 1 hour in milliseconds
    // const startTimeStr = `${startTime.getHours().toString().padStart(2, "0")}:00`;
    // const endTimeStr = `${new Date(endTime).getHours().toString().padStart(2, "0")}:00`;
    availableSlots.push({ startTime: startTime, endTime: new Date(endTime) });
    cursor = new Date(endTime);
  }
  const dayStart = new Date(requestDay);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(requestDay);
  dayEnd.setHours(23, 59, 59, 999);
  const bookingStadium = await Booking.find({
    stadiumId: new mongoose.Types.ObjectId(stadiumId),
    status: "CONFIRMED",
    startAt: {
      $gte: dayStart, 
      $lt: dayEnd, 
    },
  });



  const slots = availableSlots.map((slot) => {
    const checking = bookingStadium.some((booking) => {
      console.log("slot",slot)
      console.log("booking",booking)
      return booking.startAt < slot.endTime && booking.endAt > slot.startTime;
    });
    const startTimeStr = `${slot.startTime.getHours().toString().padStart(2, "0")}:00`;
    const endTimeStr = `${slot.endTime.getHours().toString().padStart(2, "0")}:00`;

    return {
      startTime: startTimeStr,
      endTime: endTimeStr,
      status: checking ? "booked" : "available",
    };
  });
  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }
  // console.dir(aggregateStadium, { depth: null })
  if (!dayRequested || !dayRequested.isOpen) {
    return {
      stadiumId: stadium._id,
      date,
      pricePerHour: stadium.pricePerHour,
      isOpen: false,
      slots: [],
    };
  }
  return { stadiumId: stadium._id, date, isOpen: true, slots };
};
