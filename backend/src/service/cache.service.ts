import { redis } from "../config/redis";

export const getCachedValue = async <T>(key: string): Promise<T | null> => {
  if (!redis) {
    return null;
  }

  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.warn(`[Redis] Read failed for ${key}`, error);
    return null;
  }
};

export const setCachedValue = async <T>(
  key: string,
  value: T,
  ttlSeconds: number
) => {
  if (!redis) {
    return;
  }

  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.warn(`[Redis] Write failed for ${key}`, error);
  }
};

export const incrementCachedCounter = async (key: string) => {
  if (!redis) {
    return null;
  }

  try {
    return await redis.incr(key);
  } catch (error) {
    console.warn(`[Redis] Increment failed for ${key}`, error);
    return null;
  }
};
