import Redis from 'ioredis';

let redis;

export function getRedis() {
  if (!redis) {
    // Use default Redis connection (localhost:6379) for development
    // For production, use REDIS_URL environment variable
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379/0';
    
    redis = new Redis(redisUrl, {
      enableReadyCheck: false,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
    });

    redis.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redis.on('connect', () => {
      console.log('Redis connected');
    });
  }

  return redis;
}

export async function closeRedis() {
  if (redis) {
    await redis.quit();
    redis = null;
  }
}
