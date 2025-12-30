import { Request, Response, NextFunction } from 'express';
import cacheService from '../utils/cache';

export const cacheMiddleware = (ttl: number = 300) => { // Default TTL of 5 minutes
  return async (req: Request, res: Response, next: NextFunction) => {
    // Create a cache key based on the URL and query parameters
    const cacheKey = `cache:${req.originalUrl}`;
    
    // Try to get the cached response
    const cachedResponse = await cacheService.get<any>(cacheKey);
    
    if (cachedResponse) {
      // If we have a cached response, send it directly
      console.log(`Cache hit for key: ${cacheKey}`);
      return res.json(cachedResponse);
    }
    
    // If no cached response, continue with the request
    // But override the res.json method to cache the response
    const originalJson = res.json;
    res.json = function (body: any) {
      // Cache the response before sending
      cacheService.set(cacheKey, body, { ttl });
      console.log(`Cache set for key: ${cacheKey} with TTL: ${ttl}s`);
      return originalJson.call(this, body);
    };
    
    next();
  };
};

// Middleware to clear cache for specific routes
export const invalidateCache = (pattern: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Clear cache matching the pattern
    const clearedCount = await cacheService.clearPattern(pattern);
    console.log(`Cleared ${clearedCount} cache entries matching pattern: ${pattern}`);
    next();
  };
};