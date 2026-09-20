import mongoose, { Schema, type Document } from "mongoose";

export interface IConversation extends Document {
  playerId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  stadiumId: mongoose.Types.ObjectId;
}

export interface IMessage extends Document {
  conversationId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
}

const conversationSchema = new Schema<IConversation>(
  {
    playerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    stadiumId: {
      type: Schema.Types.ObjectId,
      ref: "Stadium",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

conversationSchema.index(
  { playerId: 1, ownerId: 1, stadiumId: 1 },
  { unique: true }
);

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Conversation = mongoose.model<IConversation>(
  "Conversation",
  conversationSchema
);
export const Message = mongoose.model<IMessage>("Message", messageSchema);