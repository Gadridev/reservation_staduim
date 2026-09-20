import type { Request, Response, NextFunction } from "express";
import {
  createOrGetConversation as createOrGetConversationService,
  getMyConversations as getMyConversationsService,
  getConversationById as getConversationByIdService,
  sendMessage as sendMessageService,
  getConversationMessages as getConversationMessagesService,
} from "./conversation.service.js";
import type {
  ConversationListQuery,
  MessageListQuery,
} from "./conversation.validation.js";

export async function createOrGetConversation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const conversation = await createOrGetConversationService(
      req.user!._id,
      req.body,
    );
    res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

export async function getMyConversations(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery as ConversationListQuery;
    const { conversations, pagination } = await getMyConversationsService(
      { _id: req.user!._id, role: req.user!.role },
      query,
    );
    res.status(200).json({ success: true, data: conversations, pagination });
  } catch (err) {
    next(err);
  }
}

export async function getConversationById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const conversation = await getConversationByIdService(
      req.params.conversationId as string,
      {
        _id: req.user!._id,
        role: req.user!.role,
      },
    );
    res.status(200).json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

export async function sendMessage(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const message = await sendMessageService(
      req.params.conversationId as string,
      { _id: req.user!._id, role: req.user!.role },
      req.body,
    );
    res.status(201).json({ success: true, data: message });
  } catch (err) {
    next(err);
  }
}

export async function getConversationMessages(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const query = req.validatedQuery as MessageListQuery;
    const { messages, pagination } = await getConversationMessagesService(
      req.params.conversationId as string,
      { _id: req.user!._id, role: req.user!.role },
      query,
    );
    res.status(200).json({ success: true, data: messages, pagination });
  } catch (err) {
    next(err);
  }
}
