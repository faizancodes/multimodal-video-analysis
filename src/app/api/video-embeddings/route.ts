import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { extractVisualDescriptions } from "@/utils/videoDescriptionExtractor";
import { generateBatchEmbeddings } from "@/utils/embeddingClient";
import {
  getCachedVideoEmbeddings,
  cacheVideoEmbeddings,
} from "@/utils/redisClient";
import type { EmbeddingData } from "@/utils/embeddingClient";

const logger = new Logger("VideoEmbeddings");

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

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

    // Extract visual descriptions using Gemini
    logger.info("🎥 Extracting visual descriptions", { requestId });
    const descriptions = await extractVisualDescriptions(
      videoUrl,
      intervalSeconds
    );

    if (descriptions.length === 0) {
      return NextResponse.json(
        { error: "No visual descriptions could be extracted from the video" },
        { status: 404 }
      );
    }

    logger.info("📝 Visual descriptions extracted", {
      requestId,
      count: descriptions.length,
    });

    // Generate embeddings for all descriptions
    logger.info("🧠 Generating embeddings", { requestId });
    const texts = descriptions.map(desc => desc.description);
    const embeddingVectors = await generateBatchEmbeddings(texts);

    // Combine descriptions with embeddings
    embeddings = descriptions.map((desc, index) => ({
      text: desc.description,
      embedding: embeddingVectors[index],
      timestamp: desc.timestamp,
      videoId: videoId,
    })) as EmbeddingData[];

    // Cache the embeddings
    await cacheVideoEmbeddings(videoId, embeddings);

    const totalTime = Date.now() - startTime;

    logger.info("✅ Video embeddings generated successfully", {
      requestId,
      embeddingCount: embeddings.length,
      processingTime: totalTime,
    });

    return NextResponse.json({
      videoId,
      embeddings,
      cached: false,
      processingTime: totalTime,
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;

    logger.error("💥 Video embeddings error", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      processingTime: totalTime,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
