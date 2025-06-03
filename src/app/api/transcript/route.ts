import { NextRequest, NextResponse } from "next/server";
import { TranscriptService } from "@/services/transcript-service";
import { formatTranscriptWithTimestamps } from "@/utils/transcriptFormatter";
import {
  getCachedVideoTranscript,
  cacheVideoTranscript,
} from "@/utils/redisClient";

/**
 * POST /api/transcript
 * Fetches and formats transcript for a YouTube video with Redis caching
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { videoId } = body;

    // Input validation
    if (!videoId) {
      return NextResponse.json(
        { error: "Video ID is required" },
        { status: 400 }
      );
    }

    console.log("Fetching transcript for video ID:", videoId);

    // Try to get cached transcript first
    let transcriptData = await getCachedVideoTranscript(videoId);
    let transcriptSource: "youtube-direct" | "fallback-api" = "youtube-direct";

    if (!transcriptData) {
      console.log("Transcript not found in cache, fetching from sources...");

      // Fetch transcript using the service (server-side)
      const result = await TranscriptService.fetchTranscript(videoId);

      if (!result || !result.transcript) {
        return NextResponse.json(
          { error: "Could not fetch transcript for this video" },
          { status: 404 }
        );
      }

      transcriptData = result.transcript;
      transcriptSource = result.source;

      // Cache the transcript for future requests
      await cacheVideoTranscript(videoId, transcriptData);
      console.log("Transcript cached successfully from", transcriptSource);
    } else {
      console.log("Using cached transcript data");
    }

    // Format the transcript
    const formattedTranscript = formatTranscriptWithTimestamps(transcriptData);

    console.log("Transcript fetched and formatted successfully");

    return NextResponse.json(
      {
        transcript: formattedTranscript,
        source: transcriptSource,
        videoId,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Transcript fetch error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch transcript";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
