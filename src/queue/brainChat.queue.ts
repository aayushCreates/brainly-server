import { redisConnection } from "@/config/redis.config";
import { Queue } from "bullmq";


export const brainChatQueue = new Queue('brain-chat', {
    connection: redisConnection
});

