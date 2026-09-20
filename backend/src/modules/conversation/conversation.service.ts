import mongoose from "mongoose";
import { Conversation, Message } from "./conversation.model.js";
import { Stadium } from "../stadium/stadium.model.js";
import { Booking } from "../booking/booking.model.js";
import { AppError } from "../../shared/errors/AppError.js";
import type {
  CreateConversationInput,
  SendMessageInput,
  ConversationListQuery,
  MessageListQuery,
} from "./conversation.validation.js";

interface AuthUser {
  _id: mongoose.Types.ObjectId;
  role: "PLAYER" | "OWNER" | "ADMIN";
}

export async function findConversationAndVerifyAccess(
  conversationId: string,
  user: AuthUser
) {
  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new AppError("Conversation not found", 404);
  }

  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new AppError("Conversation not found", 404);
  }

  const isParticipant =
    conversation.playerId.toString() === user._id.toString() ||
    conversation.ownerId.toString() === user._id.toString();

  if (!isParticipant) {
    throw new AppError("You do not have permission to access this conversation", 403);
  }

  return conversation;
}

export async function createOrGetConversation(
  playerId: mongoose.Types.ObjectId,
  input: CreateConversationInput
) {
  if (!mongoose.Types.ObjectId.isValid(input.stadiumId)) {
    throw new AppError("Stadium not found", 404);
  }

  const stadium = await Stadium.findById(input.stadiumId);

  if (!stadium) {
    throw new AppError("Stadium not found", 404);
  }

  const hasEligibleBooking = await Booking.findOne({
    playerId,
    stadiumId: stadium._id,
    status: { $in: ["CONFIRMED", "COMPLETED"] },
  });

  if (!hasEligibleBooking) {
    throw new AppError(
      "You must have a confirmed or completed booking with this stadium to start a conversation",
      403
    );
  }

  const existing = await Conversation.findOne({
    playerId,
    ownerId: stadium.ownerId,
    stadiumId: stadium._id,
  });

  if (existing) {
    return existing;
  }

  try {
    const conversation = await Conversation.create({
      playerId,
      ownerId: stadium.ownerId,
      stadiumId: stadium._id,
    });

    return conversation;
  } catch (err: any) {
    if (err.code === 11000) {
      // Race condition: another request created it a moment earlier.
      const raceExisting = await Conversation.findOne({
        playerId,
        ownerId: stadium.ownerId,
        stadiumId: stadium._id,
      });
      if (raceExisting) return raceExisting;
    }
    throw err;
  }
}

export async function getMyConversations(
  user: AuthUser,
  query: ConversationListQuery
) {
  const filter = {
    $or: [{ playerId: user._id }, { ownerId: user._id }],
  };

  const skip = (query.page - 1) * query.limit;

  const [conversations, total] = await Promise.all([
    Conversation.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("stadiumId", "name")
      .populate("playerId", "firstName lastName")
      .populate("ownerId", "firstName lastName"),
    Conversation.countDocuments(filter),
  ]);

  return {
    conversations,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(Math.ceil(total / query.limit), 1),
    },
  };
}

export async function getConversationById(conversationId: string, user: AuthUser) {
  const conversation = await findConversationAndVerifyAccess(conversationId, user);

  await conversation.populate([
    { path: "stadiumId", select: "name" },
    { path: "playerId", select: "firstName lastName" },
    { path: "ownerId", select: "firstName lastName" },
  ]);

  return conversation;
}

export async function sendMessage(
  conversationId: string,
  user: AuthUser,
  input: SendMessageInput
) {
  const conversation = await findConversationAndVerifyAccess(conversationId, user);

  const message = await Message.create({
    conversationId: conversation._id,
    senderId: user._id,
    content: input.content,
  });

  return message;
}

export async function getConversationMessages(
  conversationId: string,
  user: AuthUser,
  query: MessageListQuery
) {
  const conversation = await findConversationAndVerifyAccess(conversationId, user);

  const filter = { conversationId: conversation._id };
  const skip = (query.page - 1) * query.limit;

  const [messages, total] = await Promise.all([
    Message.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(query.limit)
      .populate("senderId", "firstName lastName"),
    Message.countDocuments(filter),
  ]);

  return {
    messages,
    pagination: {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(Math.ceil(total / query.limit), 1),
    },
  };
}