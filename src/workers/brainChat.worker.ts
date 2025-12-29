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

    try {
        const conversation = await prisma.conversation.findFirst({
        where: {
            id: conversationId,
            userId: userId,
        },
        include: {
            messages: {
            orderBy: { createdAt: "asc" },
            take: 20,
            },
        },
        });


        if (!conversation) {
            console.error(`[BrainChatWorker] Conversation ${conversationId} not found`);
            throw new Error("Conversation not found");
        }

        const userMessage = conversation.messages.find(
            (m) => m.id === messageId
        );

        if (!userMessage) {
            console.error(`[BrainChatWorker] Message ${messageId} not found in conversation`);
            throw new Error("User message not found in conversation");
        }

        const queryEmbedding = await getEmbeddedText(
            userMessage?.content as string
        );

        
        const vectorQuery = `[${queryEmbedding.join(",")}]`;

        const relevantChunks = await prisma.$queryRaw`
        SELECT text
        FROM "KnowledgeChunk"
        WHERE "userId" = ${userId}
        ORDER BY embedding <-> ${vectorQuery}::vector
        LIMIT 5
      ` as { text: string }[];

        //  GET Prompt
        const prompt = getPrompt({
            userQuestion: userMessage.content,
            relevantChunks: relevantChunks || [],
            recentMessages: conversation.messages,
        });

        const aiResponseOutput = await callLLM(prompt);

        if (!aiResponseOutput) {
            throw new Error("Received empty response from LLM");
        }

        const saveAiResponseMessage = await prisma.message.create({
        data: {
            role: "AI",
            content: aiResponseOutput,
            conversationId: conversationId,
        },
        });

        return saveAiResponseMessage;

    } catch (error) {
        console.error("[BrainChatWorker] Job failed:", error);
        throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5, 
  }
);