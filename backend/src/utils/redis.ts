import { createClient } from "redis";
import dotenv from "dotenv";
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
    socket: redisUrl.startsWith("rediss://")
      ? { tls: true }  // secure hosted Redis (Redis Cloud)
      : undefined      // local redis://localhost:6379
  });

  client.on("connect", () => console.log("Redis connected"));
  client.on("error", (err) => console.error("Redis error:", err));

  await client.connect();
  redisClient = client;
  return client;
};

export const getRedisClient = () => redisClient;
