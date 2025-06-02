import { Redis } from "@upstash/redis";
import { env } from "@/app/config/env";
import { Logger } from "@/utils/logger";

const logger = new Logger("RedisClient");

// Type for YouTube transcript data (matches youtube-transcript library)
type TranscriptItem = {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
};

// Initialize Redis client
const redisClient = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Helper function to generate cache key for video transcript
export function getVideoTranscriptKey(videoId: string): string {
  return `video:transcript:${videoId}`;
}

// Cache transcript data
export async function cacheVideoTranscript(
  videoId: string,
  transcript: TranscriptItem[]
): Promise<void> {
  try {
    const key = getVideoTranscriptKey(videoId);
    logger.info(`Caching transcript for video ${videoId}`);

    // Cache for 30 days (in seconds)
    const expirationTime = 30 * 24 * 60 * 60;

    await redisClient.setex(key, expirationTime, JSON.stringify(transcript));
    logger.info(`Successfully cached transcript for video ${videoId}`);
  } catch (error) {
    logger.error(`Failed to cache transcript for video ${videoId}`, error);
    // Don't throw error - caching is not critical for the app functionality
  }
}

// Retrieve cached transcript
export async function getCachedVideoTranscript(
  videoId: string
): Promise<TranscriptItem[] | null> {
  try {
    const key = getVideoTranscriptKey(videoId);
    logger.info(`Checking cache for video transcript ${videoId}`);

    const cachedData = await redisClient.get(key);

    if (cachedData) {
      logger.info(`Found cached transcript for video ${videoId}`);
      return typeof cachedData === "string"
        ? JSON.parse(cachedData)
        : cachedData;
    }

    logger.info(`No cached transcript found for video ${videoId}`);
    return null;
  } catch (error) {
    logger.error(
      `Failed to retrieve cached transcript for video ${videoId}`,
      error
    );
    // Return null on error - we'll fallback to fetching from YouTube
    return null;
  }
}

// Optional: Clear cached transcript (useful for debugging or manual cache invalidation)
export async function clearVideoTranscriptCache(
  videoId: string
): Promise<void> {
  try {
    const key = getVideoTranscriptKey(videoId);
    await redisClient.del(key);
    logger.info(`Cleared cached transcript for video ${videoId}`);
  } catch (error) {
    logger.error(
      `Failed to clear cached transcript for video ${videoId}`,
      error
    );
  }
}

export { redisClient };
