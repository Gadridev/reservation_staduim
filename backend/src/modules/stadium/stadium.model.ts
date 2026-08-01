import mongoose, { Schema, type Document } from "mongoose";
import { DEFAULT_WORKING_HOURS } from "../../shared/constants/defaultWorkingHours.js";

export interface ILocation {
  address: string;
  city: string;
  coordinates: {
    type: "Point";
    coordinates: [number, number]; 
  };
}
export interface IWorkingDay {
    dayOfWeek: number;
    isOpen: boolean;
    openTime: string | null;
    closeTime: string | null;
}

export interface IStadium extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  location: ILocation;
  images: string[];
  amenities: string[];
  pricePerHour: number;
  averageRating: number;
  reviewCount: number;
  isActive: boolean;
  workingHours: IWorkingDay[]
}
const workingDaySchema = new Schema<IWorkingDay>(
  {
    dayOfWeek: {
      type: Number,
      required: true,
      min: 0,
      max: 6,
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    openTime: {
      type: String,
      default: null,
    },
    closeTime: {
      type: String,
      default: null,
    },
  },
  {
    _id: false,
  }
);

const locationSchema = new Schema<ILocation>(
  {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    coordinates: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], 
        required: true,
      },
    },
  },
  { _id: false } 
);

const stadiumSchema = new Schema<IStadium>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: locationSchema,
      required: true,
    },
    images: {
      type: [String],
      default: [],
    },
    amenities: {
      type: [String],
      default: [],
    },
    pricePerHour: {
      type: Number,
      required: true,
      min: [1, "Price must be a positive number"],
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    workingHours:{
      type:[workingDaySchema],
      default:DEFAULT_WORKING_HOURS
    }
  },
  { timestamps: true }
);
stadiumSchema.index({ "location.coordinates": "2dsphere" });
export const Stadium = mongoose.model<IStadium>("Stadium", stadiumSchema);