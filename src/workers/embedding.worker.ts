import { redisConnection } from "@/config/redis.config";
import getEmbeddedText from "@/utils/embeddings.utils";
import { PrismaClient } from "@prisma/client";
import { Worker } from "bullmq";

const prisma = new PrismaClient();

export const embeddingWorker = new Worker("data-embedding", async (job)=> {
    const { userId, sourceType, sourceId, text } = job.data;

    const embeddedText = await getEmbeddedText(text);

    await prisma.knowledgeChunk.upsert({
        where: {
          contentId: sourceType.toLowerCase() === "content" ? sourceId : null,
          taskId: sourceType.toLowerCase() === "task" ? sourceId : null
        },
        update: {
          text,
          embedding: embeddedText
        },
        create: {
          userId,
          text,
          embedding: embeddedText,
          contentId: sourceType.toLowerCase() === "content" ? sourceId : null,
          taskId: sourceType.toLowerCase() === "task" ? sourceId : null
        }
      });
}, {
    connection: redisConnection,
    concurrency: 5
})
