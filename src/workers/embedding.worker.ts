import { redisConnection } from "@/config/redis.config";
import getEmbeddedText from "@/utils/embeddings.utils";
import { PrismaClient } from "@prisma/client";
import { Worker } from "bullmq";

const prisma = new PrismaClient();

export const embeddingWorker = new Worker(
  "data-embedding",
  async (job) => {
    const { userId, sourceType, sourceId, text } = job.data;

    let embeddedText: number[];
    try {
      embeddedText = await getEmbeddedText(text);
    } catch (err) {
      console.error("Embedding generation failed:", err);
      throw err;
    }
    const vectorString = `[${embeddedText.join(",")}]`;

    try {
      if (sourceType.toLowerCase() === "content") {
        await prisma.$executeRaw`
    INSERT INTO "KnowledgeChunk"
    ("userId", "contentId", "text", "embedding")
    VALUES (
      ${userId},
      ${sourceId},
      ${text},
      ${vectorString}::vector
    )
    ON CONFLICT ("contentId")
    DO UPDATE SET
      "text" = EXCLUDED."text",
      "embedding" = EXCLUDED."embedding";
  `;
      } else if (sourceType.toLowerCase() === "task") {
        await prisma.$executeRaw`
        INSERT INTO "KnowledgeChunk"
        ("userId", "taskId", "text", "embedding")
        VALUES (
          ${userId},
          ${sourceId},
          ${text},
          ${vectorString}::vector
        )
        ON CONFLICT ("taskId")
        DO UPDATE SET
          "text" = EXCLUDED."text",
          "embedding" = EXCLUDED."embedding";
      `;
      }
    } catch (err) {
      console.error("Error executing raw SQL for embedding:", err);
      throw err;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  }
);
