import { getRedisClient } from './redis';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const client = getRedisClient();
    if (!client) {
      console.warn('Redis client not available, skipping cache get');
      return null;
    }

    try {
      const value = await client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options?: CacheOptions): Promise<boolean> {
    const client = getRedisClient();
    if (!client) {
      console.warn('Redis client not available, skipping cache set');
      return false;
    }

    try {
      const stringValue = JSON.stringify(value);
      if (options?.ttl) {
        await client.set(key, stringValue, { EX: options.ttl });
      } else {
        await client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      console.error(`Error setting cache key ${key}:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) {
      console.warn('Redis client not available, skipping cache delete');
      return false;
    }

    try {
      const result = await client.del(key);
      return result > 0;
    } catch (error) {
      console.error(`Error deleting cache key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    const client = getRedisClient();
    if (!client) {
      return false;
    }

    try {
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Error checking existence of cache key ${key}:`, error);
      return false;
    }
  }

  async clearPattern(pattern: string): Promise<number> {
    const client = getRedisClient();
    if (!client) {
      console.warn('Redis client not available, skipping cache clear');
      return 0;
    }

    try {
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        const result = await client.del(keys);
        return result;
      }
      return 0;
    } catch (error) {
      console.error(`Error clearing cache pattern ${pattern}:`, error);
      return 0;
    }
  }
}

export default new CacheService();