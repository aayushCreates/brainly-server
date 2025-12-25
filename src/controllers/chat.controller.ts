import { brainChatQueue } from "@/queue/brainChat.queue";
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

const prisma = new PrismaClient();

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
    });
    if (Array.isArray(conversations) && conversations.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Conversations are not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Conversations got successfully",
      data: conversations
    });
  } catch (err) {
    console.log("Error in getting all conversations");
    return res.status(500).json("Server error in getting all conversations");
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
            userId: user?.id
        }
    });
    if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation is not found",
        });
    }

    res.status(200).json({
      success: true,
      message: "Conversation got successfully",
      data: conversation
    });
  } catch (err) {
    console.log("Error in getting conversation");
    return res.status(500).json("Server error in getting conversation");
  }
};

export const createConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;

    const newConversation = await prisma.conversation.create({
      data: {
        userId: user?.id
      }
    });

    res.status(200).json({
      success: true,
      message: "New conversation created successfully",
      data: newConversation
    })

  } catch (err) {
    console.log("Error in creating conversation");
    return res.status(500).json("Server error in creating conversation");
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
        userId: user?.id
      },
      select: {
        id: true,
        messages : {
          select: {
            id: true,
            role: true,
            content: true
          }
        }
      }
    });
    if(!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      })
    }

    res.status(200).json({
      success: true,
      message: "Conversation got successfully",
      data: conversation
    });

  } catch (err) {
    console.log("Error in getting all conversation messages");
    return res
      .status(500)
      .json("Server error in getting all conversation messages");
  }
};

export const saveConversationMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const id = req.params.id as string;
    const { content } = req.body;

    if(!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Message content is required"
      });
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: user?.id
      }
    });
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation is not found",
      });
  }

  const newMessage = await prisma.message.create({
    data: {
      role: "USER",
      content: content.trim(),
      conversationId: id
    }
  });


  await brainChatQueue.add("PROCESS_MESSAGE", {
    conversationId: id,
    messageId: newMessage.id,
    userId: user?.id
  }, {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000
    }
  });

    res.status(200).json({
      success: true,
      message: "New message is added in conversation successfully",
      data: newMessage
    })

  } catch (err) {
    console.log("Error in creating conversation");
    return res.status(500).json("Server error in creating conversation");
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

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: id,
        userId: user?.id
      }
    });
    if(!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found"
      })
    }

    const deletedConversation = await prisma.conversation.delete({
      where: {
        id: id
      }
    });

    res.status(200).json({
        success: true,
        message: "Conversation deleted successfully"
    })

  } catch (err) {
    console.log("Error in deleting conversation");
    return res.status(500).json("Server error in deleting conversation");
  }
};
