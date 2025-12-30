import { createClient, type RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: ReturnType<typeof createClient> | null = null;

const initializeRedis = async (): Promise<ReturnType<typeof createClient> | null> => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    const client = createClient({
      url: redisUrl
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('Redis connected successfully');
    });

    client.on('reconnecting', () => {
      console.log('Redis reconnecting...');
    });

    await client.connect();
    redisClient = client;

    return client;
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
    return null;
  }
};

const getRedisClient = (): ReturnType<typeof createClient> | null => {
  return redisClient;
};

export { initializeRedis, getRedisClient };