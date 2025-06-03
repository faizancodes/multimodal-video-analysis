import { Redis } from "@upstash/redis";
import { env } from "@/app/config/env";
import { Logger } from "@/utils/logger";
import { EmbeddingData } from "@/utils/embeddingClient";
import type { VisualDescription } from "@/utils/videoDescriptionExtractor";

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

// Helper function to generate cache key for video embeddings
export function getVideoEmbeddingsKey(videoId: string): string {
  return `video:embeddings:${videoId}`;
}

// Helper function to generate cache key for video descriptions
export function getVideoDescriptionsKey(
  videoId: string,
  intervalSeconds: number
): string {
  return `video:descriptions:${videoId}:interval-${intervalSeconds}`;
}

// Helper function to generate cache key for chunked video descriptions
export function getVideoDescriptionsChunkedKey(
  videoId: string,
  intervalSeconds: number,
  chunkDurationMinutes: number
): string {
  return `video:descriptions:chunked:${videoId}:interval-${intervalSeconds}:chunk-${chunkDurationMinutes}`;
}

// Helper function to generate cache key for time range video descriptions
export function getVideoDescriptionsTimeRangeKey(
  videoId: string,
  startSeconds: number,
  endSeconds: number,
  intervalSeconds: number
): string {
  return `video:descriptions:range:${videoId}:${startSeconds}-${endSeconds}:interval-${intervalSeconds}`;
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

// Cache video embeddings
export async function cacheVideoEmbeddings(
  videoId: string,
  embeddings: EmbeddingData[]
): Promise<void> {
  try {
    const key = getVideoEmbeddingsKey(videoId);
    logger.info(`Caching embeddings for video ${videoId}`, {
      count: embeddings.length,
    });

    // Cache for 30 days (in seconds)
    const expirationTime = 30 * 24 * 60 * 60;

    await redisClient.setex(key, expirationTime, JSON.stringify(embeddings));
    logger.info(`Successfully cached embeddings for video ${videoId}`);
  } catch (error) {
    logger.error(`Failed to cache embeddings for video ${videoId}`, error);
    // Don't throw error - caching is not critical for the app functionality
  }
}

// Retrieve cached video embeddings
export async function getCachedVideoEmbeddings(
  videoId: string
): Promise<EmbeddingData[] | null> {
  try {
    const key = getVideoEmbeddingsKey(videoId);
    logger.info(`Checking cache for video embeddings ${videoId}`);

    const cachedData = await redisClient.get(key);

    if (cachedData) {
      logger.info(`Found cached embeddings for video ${videoId}`);
      return typeof cachedData === "string"
        ? JSON.parse(cachedData)
        : cachedData;
    }

    logger.info(`No cached embeddings found for video ${videoId}`);
    return null;
  } catch (error) {
    logger.error(
      `Failed to retrieve cached embeddings for video ${videoId}`,
      error
    );
    // Return null on error - we'll fallback to generating new embeddings
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

// Optional: Clear cached embeddings (useful for debugging or manual cache invalidation)
export async function clearVideoEmbeddingsCache(
  videoId: string
): Promise<void> {
  try {
    const key = getVideoEmbeddingsKey(videoId);
    await redisClient.del(key);
    logger.info(`Cleared cached embeddings for video ${videoId}`);
  } catch (error) {
    logger.error(
      `Failed to clear cached embeddings for video ${videoId}`,
      error
    );
  }
}

// Cache video descriptions
export async function cacheVideoDescriptions(
  videoId: string,
  intervalSeconds: number,
  descriptions: VisualDescription[]
): Promise<void> {
  try {
    const key = getVideoDescriptionsKey(videoId, intervalSeconds);
    logger.info(`Caching descriptions for video ${videoId}`, {
      count: descriptions.length,
      intervalSeconds,
    });

    // Cache for 30 days (in seconds) - descriptions don't change for the same video
    const expirationTime = 30 * 24 * 60 * 60;

    await redisClient.setex(key, expirationTime, JSON.stringify(descriptions));
    logger.info(`Successfully cached descriptions for video ${videoId}`);
  } catch (error) {
    logger.error(`Failed to cache descriptions for video ${videoId}`, error);
    // Don't throw error - caching is not critical for the app functionality
  }
}

// Retrieve cached video descriptions
export async function getCachedVideoDescriptions(
  videoId: string,
  intervalSeconds: number
): Promise<VisualDescription[] | null> {
  try {
    const key = getVideoDescriptionsKey(videoId, intervalSeconds);
    logger.info(`Checking cache for video descriptions ${videoId}`, {
      intervalSeconds,
    });

    const cachedData = await redisClient.get(key);

    if (cachedData) {
      logger.info(`Found cached descriptions for video ${videoId}`, {
        intervalSeconds,
      });
      return typeof cachedData === "string"
        ? JSON.parse(cachedData)
        : cachedData;
    }

    logger.info(`No cached descriptions found for video ${videoId}`, {
      intervalSeconds,
    });
    return null;
  } catch (error) {
    logger.error(
      `Failed to retrieve cached descriptions for video ${videoId}`,
      error
    );
    // Return null on error - we'll fallback to generating new descriptions
    return null;
  }
}

// Cache chunked video descriptions
export async function cacheVideoDescriptionsChunked(
  videoId: string,
  intervalSeconds: number,
  chunkDurationMinutes: number,
  descriptions: VisualDescription[]
): Promise<void> {
  try {
    const key = getVideoDescriptionsChunkedKey(
      videoId,
      intervalSeconds,
      chunkDurationMinutes
    );
    logger.info(`Caching chunked descriptions for video ${videoId}`, {
      count: descriptions.length,
      intervalSeconds,
      chunkDurationMinutes,
    });

    // Cache for 30 days (in seconds)
    const expirationTime = 30 * 24 * 60 * 60;

    await redisClient.setex(key, expirationTime, JSON.stringify(descriptions));
    logger.info(
      `Successfully cached chunked descriptions for video ${videoId}`
    );
  } catch (error) {
    logger.error(
      `Failed to cache chunked descriptions for video ${videoId}`,
      error
    );
    // Don't throw error - caching is not critical for the app functionality
  }
}

// Retrieve cached chunked video descriptions
export async function getCachedVideoDescriptionsChunked(
  videoId: string,
  intervalSeconds: number,
  chunkDurationMinutes: number
): Promise<VisualDescription[] | null> {
  try {
    const key = getVideoDescriptionsChunkedKey(
      videoId,
      intervalSeconds,
      chunkDurationMinutes
    );
    logger.info(`Checking cache for chunked video descriptions ${videoId}`, {
      intervalSeconds,
      chunkDurationMinutes,
    });

    const cachedData = await redisClient.get(key);

    if (cachedData) {
      logger.info(`Found cached chunked descriptions for video ${videoId}`, {
        intervalSeconds,
        chunkDurationMinutes,
      });
      return typeof cachedData === "string"
        ? JSON.parse(cachedData)
        : cachedData;
    }

    logger.info(`No cached chunked descriptions found for video ${videoId}`, {
      intervalSeconds,
      chunkDurationMinutes,
    });
    return null;
  } catch (error) {
    logger.error(
      `Failed to retrieve cached chunked descriptions for video ${videoId}`,
      error
    );
    // Return null on error - we'll fallback to generating new descriptions
    return null;
  }
}

// Cache time range video descriptions
export async function cacheVideoDescriptionsTimeRange(
  videoId: string,
  startSeconds: number,
  endSeconds: number,
  intervalSeconds: number,
  descriptions: VisualDescription[]
): Promise<void> {
  try {
    const key = getVideoDescriptionsTimeRangeKey(
      videoId,
      startSeconds,
      endSeconds,
      intervalSeconds
    );
    logger.info(`Caching time range descriptions for video ${videoId}`, {
      count: descriptions.length,
      startSeconds,
      endSeconds,
      intervalSeconds,
    });

    // Cache for 30 days (in seconds)
    const expirationTime = 30 * 24 * 60 * 60;

    await redisClient.setex(key, expirationTime, JSON.stringify(descriptions));
    logger.info(
      `Successfully cached time range descriptions for video ${videoId}`
    );
  } catch (error) {
    logger.error(
      `Failed to cache time range descriptions for video ${videoId}`,
      error
    );
    // Don't throw error - caching is not critical for the app functionality
  }
}

// Retrieve cached time range video descriptions
export async function getCachedVideoDescriptionsTimeRange(
  videoId: string,
  startSeconds: number,
  endSeconds: number,
  intervalSeconds: number
): Promise<VisualDescription[] | null> {
  try {
    const key = getVideoDescriptionsTimeRangeKey(
      videoId,
      startSeconds,
      endSeconds,
      intervalSeconds
    );
    logger.info(`Checking cache for time range video descriptions ${videoId}`, {
      startSeconds,
      endSeconds,
      intervalSeconds,
    });

    const cachedData = await redisClient.get(key);

    if (cachedData) {
      logger.info(`Found cached time range descriptions for video ${videoId}`, {
        startSeconds,
        endSeconds,
        intervalSeconds,
      });
      return typeof cachedData === "string"
        ? JSON.parse(cachedData)
        : cachedData;
    }

    logger.info(
      `No cached time range descriptions found for video ${videoId}`,
      {
        startSeconds,
        endSeconds,
        intervalSeconds,
      }
    );
    return null;
  } catch (error) {
    logger.error(
      `Failed to retrieve cached time range descriptions for video ${videoId}`,
      error
    );
    // Return null on error - we'll fallback to generating new descriptions
    return null;
  }
}

// Optional: Clear cached video descriptions (useful for debugging or manual cache invalidation)
export async function clearVideoDescriptionsCache(
  videoId: string,
  intervalSeconds?: number
): Promise<void> {
  try {
    if (intervalSeconds) {
      // Clear specific interval cache
      const key = getVideoDescriptionsKey(videoId, intervalSeconds);
      await redisClient.del(key);
      logger.info(
        `Cleared cached descriptions for video ${videoId} with interval ${intervalSeconds}`
      );
    } else {
      // Clear all description caches for this video (pattern-based deletion)
      const pattern = `video:descriptions:${videoId}:*`;
      // Note: Upstash Redis might not support KEYS command in production
      // This is a fallback approach - in production, you might need to track keys separately
      logger.info(
        `Would clear all cached descriptions for video ${videoId} (pattern: ${pattern})`
      );
    }
  } catch (error) {
    logger.error(
      `Failed to clear cached descriptions for video ${videoId}`,
      error
    );
  }
}

export { redisClient };
