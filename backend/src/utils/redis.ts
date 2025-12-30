import { createClient } from 'redis';
import dotenv from 'dotenv';
dotenv.config();

let redisClient: ReturnType<typeof createClient> | null = null;

export const initializeRedis = async () => {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.warn("REDIS_URL is not set");
    return null;
  }

  const client = createClient({
    url: redisUrl,
    // TLS settings for cloud Redis
    tls: {
      rejectUnauthorized: false
    }
  });

  client.on("connect", () => console.log("Redis connected"));
  client.on("error", (err) => console.error("Redis error:", err));

  try {
    await client.connect();
    redisClient = client;
    return client;
  } catch (error) {
    console.error("Redis connection failed:", error);
    return null;
  }
};

export const getRedisClient = () => redisClient;