import mongoose, { Schema, type Document } from "mongoose";

export interface IImage extends Document {
  stadiumId: mongoose.Types.ObjectId;
  url: string;
  publicId: string;
  isPrimary: boolean;
}

const imageSchema = new Schema<IImage>(
  {
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: true,
      index: true,
    },
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Image = mongoose.model<IImage>("Image", imageSchema);