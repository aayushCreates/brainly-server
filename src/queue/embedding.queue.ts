import { redisConnection } from "@/config/redis.config";
import { Queue } from "bullmq";


export const embeddingQueue = new Queue("data-embedding", {
    connection: redisConnection
})
