import { brainChatQueue } from "@/queue/brainChat.queue";
import { Request, Response, NextFunction } from "express";
import { QueueEvents } from "bullmq";
import { redisConnection } from "@/config/redis.config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const queueEvents = new QueueEvents("brain-chat", {
  connection: redisConnection,
});

export const getAllConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: user?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        messages: {
            take: 1,
            orderBy: {
                createdAt: 'desc'
            }
        }
      }
    });

    res.status(200).json({
      success: true,
      message: "Conversations fetched successfully",
      data: conversations,
    });
  } catch (err) {
    console.log("Error in getting all conversations", err);
    return res.status(500).json({
      success: false,
      message: "Server error in getting all conversations",
    });
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: user?.id,
      },
      include: {
        messages: {
            orderBy: {
                createdAt: 'asc'
            }
        },
      },
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation fetched successfully",
      data: conversation,
    });
  } catch (err) {
    console.log("Error in getting conversation", err);
    return res.status(500).json({
      success: false,
      message: "Server error in getting conversation",
    });
  }
};

export const createConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    const newConversation = await prisma.conversation.create({
      data: {
        userId: user?.id!,
      },
    });

    res.status(201).json({
      success: true,
      message: "New conversation created successfully",
      data: newConversation,
    });
  } catch (err) {
    console.log("Error in creating conversation", err);
    return res.status(500).json({
      success: false,
      message: "Server error in creating conversation",
    });
  }
};

export const getAllConversationMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: user?.id,
      },
      select: {
        id: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation messages fetched successfully",
      data: conversation,
    });
  } catch (err) {
    console.log("Error in getting all conversation messages", err);
    return res.status(500).json({
      success: false,
      message: "Server error in getting all conversation messages",
    });
  }
};

export const sendConversationMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;
    const { content } = req.body;

    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required",
      });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: user?.id,
      },
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    const newMessage = await prisma.message.create({
      data: {
        role: "USER",
        content: content.trim(),
        conversationId: id,
      },
    });

    const job = await brainChatQueue.add(
      "PROCESS_MESSAGE",
      {
        conversationId: id,
        messageId: newMessage.id,
        userId: user?.id,
      },
      {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      }
    );

    try {
      const aiResponse = await job.waitUntilFinished(queueEvents);

      res.status(201).json({
        success: true,
        message: "New message added successfully",
        data: {
          aiResponse: aiResponse,
          userPrompt: newMessage
        },
      });
    } catch (jobError) {
      console.error("Job failed or timed out:", jobError);
      res.status(201).json({
        success: true,
        message: "Message sent, but AI response is pending or failed.",
        data: newMessage,
      });
    }

  } catch (err) {
    console.log("Error in sending message", err);
    return res.status(500).json({
      success: false,
      message: "Server error in sending message",
    });
  }
};

export const deleteConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;

    const result = await prisma.conversation.deleteMany({
      where: {
        id: id,
        userId: user?.id,
      },
    });

    if (result.count === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversation deleted successfully",
    });
  } catch (err) {
    console.log("Error in deleting conversation", err);
    return res.status(500).json({
      success: false,
      message: "Server error in deleting conversation",
    });
  }
};