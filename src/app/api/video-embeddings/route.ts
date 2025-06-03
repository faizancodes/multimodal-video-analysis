import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { extractVisualDescriptions } from "@/utils/videoDescriptionExtractor";
import { generateBatchEmbeddings } from "@/utils/embeddingClient";
import {
  getCachedVideoEmbeddings,
  cacheVideoEmbeddings,
} from "@/utils/redisClient";
import type { EmbeddingData } from "@/utils/embeddingClient";
import { extractVideoId } from "@/utils/video-utils";

const logger = new Logger("VideoEmbeddings");

export const maxDuration = 300;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `emb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  logger.info("🚀 Video embeddings request started", { requestId });

  try {
    // Parse request body
    const body = await request.json();
    const { videoUrl, intervalSeconds = 30 } = body;

    // Input validation
    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL provided" },
        { status: 400 }
      );
    }

    logger.info("📋 Processing video embeddings", {
      requestId,
      videoId,
      videoUrl,
      intervalSeconds,
    });

    // Check cache first
    let embeddings = await getCachedVideoEmbeddings(videoId);

    if (embeddings) {
      logger.info("✅ Found cached embeddings", {
        requestId,
        count: embeddings.length,
      });

      return NextResponse.json({
        videoId,
        embeddings,
        cached: true,
        processingTime: Date.now() - startTime,
      });
    }

    logger.info("🔄 No cached embeddings found, generating new ones", {
      requestId,
    });

    // Extract visual descriptions using optimized Gemini processing
    logger.info("🎥 Extracting visual descriptions", { requestId });
    const descriptionStartTime = Date.now();

    const descriptions = await extractVisualDescriptions(
      videoUrl,
      intervalSeconds
    );

    const descriptionTime = Date.now() - descriptionStartTime;
    logger.info("📝 Visual descriptions extracted", {
      requestId,
      count: descriptions.length,
      processingTime: descriptionTime,
    });

    if (descriptions.length === 0) {
      logger.warn(
        "No visual descriptions extracted, checking if this is a processing error",
        {
          requestId,
          videoId,
        }
      );

      return NextResponse.json(
        {
          error:
            "No visual descriptions could be extracted from the video. This may be due to video format, length, or content issues.",
          suggestions: [
            "Try with a shorter video (under 10 minutes)",
            "Ensure the video has clear visual content",
            "Try again as this may be a temporary processing issue",
          ],
        },
        { status: 422 }
      );
    }

    // Generate embeddings for all descriptions with performance monitoring
    logger.info("🧠 Generating embeddings", { requestId });
    const embeddingStartTime = Date.now();

    const texts = descriptions.map(desc => desc.description);

    // Generate embeddings for all descriptions
    const embeddingVectors = await generateBatchEmbeddings(texts);

    const embeddingTime = Date.now() - embeddingStartTime;
    logger.info("🧠 Embeddings generated", {
      requestId,
      count: embeddingVectors.length,
      processingTime: embeddingTime,
    });

    // Combine descriptions with embeddings
    embeddings = descriptions.map((desc, index) => ({
      text: desc.description,
      embedding: embeddingVectors[index],
      timestamp: desc.timestamp,
      videoId: videoId,
    })) as EmbeddingData[];

    // Cache the embeddings (fire and forget for speed)
    cacheVideoEmbeddings(videoId, embeddings).catch(error => {
      logger.warn("Failed to cache embeddings (non-critical)", {
        requestId,
        error,
      });
    });

    const totalTime = Date.now() - startTime;

    logger.info("✅ Video embeddings generated successfully", {
      requestId,
      embeddingCount: embeddings.length,
      processingTime: totalTime,
      breakdown: {
        descriptions: descriptionTime,
        embeddings: embeddingTime,
        overhead: totalTime - descriptionTime - embeddingTime,
      },
    });

    return NextResponse.json({
      videoId,
      embeddings,
      cached: false,
      processingTime: totalTime,
      performance: {
        descriptionsMs: descriptionTime,
        embeddingsMs: embeddingTime,
        totalMs: totalTime,
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;

    logger.error("💥 Video embeddings error", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime: totalTime,
    });

    // Provide more specific error information
    if (error instanceof Error) {
      if (
        error.message.includes("quota") ||
        error.message.includes("rate limit")
      ) {
        return NextResponse.json(
          {
            error:
              "API rate limit exceeded. Please try again in a few minutes.",
          },
          { status: 429 }
        );
      }

      if (error.message.includes("timeout")) {
        return NextResponse.json(
          {
            error:
              "Video processing timeout. Try with a shorter video or try again later.",
          },
          { status: 408 }
        );
      }

      if (error.message.includes("JSON") || error.message.includes("parse")) {
        return NextResponse.json(
          {
            error:
              "Video analysis response could not be processed. Please try again or contact support.",
            details: "JSON parsing error in video description extraction",
          },
          { status: 422 }
        );
      }
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
