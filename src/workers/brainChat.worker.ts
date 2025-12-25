import { redisConnection } from "@/config/redis.config";
import getEmbeddedText from "@/utils/embeddings.utils";
import { callLLM } from "@/utils/llm.utils";
import { getPrompt } from "@/utils/promptBuilder.utils";
import { PrismaClient } from "@prisma/client";
import { Worker } from "bullmq";

const prisma = new PrismaClient();

export const brainChatWorker = new Worker(
  "brain-chat",
  async (job) => {
    const { conversationId, userId, messageId } = job.data;

    // Fetch conversation context
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        userId: userId,
      },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
          take: 10,
        },
      },
    });
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    const userMessage = conversation.messages.find(
      (m: any) => m.id === messageId
    );
    if (!userMessage) {
      throw new Error("User message not found in conversation");
    }
    
    //  Embedding Query for vector searching
    const queryEmbedding = await getEmbeddedText(userMessage?.content as string);

    // Vector Searching
    // <-> = distance operator
    // Smaller distance = more similar

    // const relevantChunks = await prisma.$queryRaw<
    //   { text: string }[]
    // >`SELECT text FROM "KnowledgeChunk" WHERE "userId"=${userId} ORDER BY embedding <-> ${queryEmbedding} LIMIT 5`;
    
    const relevantChunks = await prisma.$queryRaw<
      { text: string }[]
    >`SELECT text
      FROM "KnowledgeChunk"
      WHERE "userId" = ${userId}
      AND embedding <-> ${queryEmbedding} < 0.7
      ORDER BY embedding <-> ${queryEmbedding}
      LIMIT 5`;

    //  GET Prompt
    const prompt = getPrompt({
      userQuestion: userMessage.content,
      relevantChunks: relevantChunks,
      recentMessages: conversation.messages,
    });

    // Call LLM
    const aiResponseOutpt = await callLLM(prompt);
    // RAG = Retrieval first, Generation second

    // Save AI response message
    const saveAiResponseMessage = await prisma.message.create({
      data: {
        role: "AI",
        content: aiResponseOutpt,
        conversationId: conversationId,
      },
    });

    console.log("Processing job", job.id);
  },
  {
    connection: redisConnection,
    concurrency: 5, // One worker will process 5 jobs in parallel
  }
);
