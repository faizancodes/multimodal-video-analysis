import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { generateEmbedding, cosineSimilarity } from "@/utils/embeddingClient";
import { getCachedVideoEmbeddings } from "@/utils/redisClient";
import { extractVideoId } from "@/utils/video-utils";

const logger = new Logger("VideoSearch");

interface SearchResult {
  text: string;
  timestamp: string;
  similarity: number;
  videoId: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  logger.info("🔍 Video search request started", { requestId });

  try {
    // Parse request body
    const body = await request.json();
    const { query, videoUrl, minSimilarity = 0.3, maxResults = 10 } = body;

    // Input validation
    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

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

    logger.info("📋 Processing video search", {
      requestId,
      videoId,
      query: query.substring(0, 100),
      minSimilarity,
      maxResults,
    });

    // Get cached embeddings for the video
    const embeddings = await getCachedVideoEmbeddings(videoId);

    if (!embeddings || embeddings.length === 0) {
      return NextResponse.json(
        {
          error:
            "No embeddings found for this video. Please generate embeddings first using the /api/video-embeddings endpoint.",
          suggestion:
            "Try analyzing the video first to generate visual embeddings.",
        },
        { status: 404 }
      );
    }

    logger.info("✅ Found cached embeddings", {
      requestId,
      count: embeddings.length,
    });

    // Generate embedding for the search query
    logger.info("🧠 Generating query embedding", { requestId });
    const queryEmbedding = await generateEmbedding(query);

    // Calculate similarities
    logger.info("📊 Calculating similarities", { requestId });
    const searchResults: SearchResult[] = embeddings.map(embedding => ({
      text: embedding.text,
      timestamp: embedding.timestamp,
      similarity: cosineSimilarity(queryEmbedding, embedding.embedding),
      videoId: embedding.videoId,
    }));

    // Log similarity distribution for debugging
    const similarities = searchResults.map(r => r.similarity);
    const maxSim = Math.max(...similarities);
    const minSim = Math.min(...similarities);
    const avgSim =
      similarities.reduce((a, b) => a + b, 0) / similarities.length;

    logger.info("📊 Similarity distribution", {
      requestId,
      maxSimilarity: maxSim,
      minSimilarity: minSim,
      avgSimilarity: avgSim,
      threshold: minSimilarity,
      totalResults: searchResults.length,
    });

    // Log top 5 results before filtering
    const topResults = searchResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);

    logger.info("🔝 Top similarity scores", {
      requestId,
      query: query,
      topResults: topResults.map(r => ({
        similarity: r.similarity,
        text: r.text.substring(0, 100) + "...",
        timestamp: r.timestamp,
      })),
    });

    // Filter and sort results
    const filteredResults = searchResults
      .filter(result => result.similarity >= minSimilarity)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, maxResults);

    const totalTime = Date.now() - startTime;

    logger.info("✅ Video search completed successfully", {
      requestId,
      totalEmbeddings: embeddings.length,
      resultsFound: filteredResults.length,
      processingTime: totalTime,
      topSimilarity: filteredResults[0]?.similarity,
    });

    return NextResponse.json({
      query,
      videoId,
      results: filteredResults,
      metadata: {
        totalEmbeddings: embeddings.length,
        resultsFound: filteredResults.length,
        minSimilarity,
        processingTime: totalTime,
      },
    });
  } catch (error) {
    const totalTime = Date.now() - startTime;

    logger.error("💥 Video search error", {
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
