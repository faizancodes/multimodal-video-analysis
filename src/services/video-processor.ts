import { TranscriptService } from "./transcript-service";
import { VideoAnalysisService } from "./video-analysis-service";
import { extractVideoId } from "@/utils/video-utils";
import { formatTranscriptWithTimestamps } from "@/utils/transcriptFormatter";
import {
  getCachedVideoTranscript,
  cacheVideoTranscript,
} from "@/utils/redisClient";
import type { VideoAnalysisResponse } from "@/types/video-analysis";

/**
 * Main service for processing video analysis requests
 * Orchestrates transcript fetching, caching, formatting, and AI analysis
 */
export class VideoProcessor {
  /**
   * Process a video URL and return comprehensive analysis
   */
  static async processVideo(videoUrl: string): Promise<VideoAnalysisResponse> {
    // Extract video ID from YouTube URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL provided");
    }

    console.log("Processing video ID:", videoId);

    // Try to get cached transcript first
    let transcriptData = await getCachedVideoTranscript(videoId);
    let transcriptSource: "youtube-direct" | "fallback-api" = "youtube-direct";

    if (!transcriptData) {
      console.log("Transcript not found in cache, fetching from sources...");

      // Fetch transcript using service with fallback strategy
      const result = await TranscriptService.fetchTranscript(videoId);

      if (!result) {
        throw new Error(
          "No transcript available for this video from any source"
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

    // Format transcript into proper sentences with accurate timestamps
    const formattedTranscript = formatTranscriptWithTimestamps(transcriptData);
    console.log(
      "Formatted transcript into",
      formattedTranscript.length,
      "sentences"
    );

    // Generate AI analysis
    const topics =
      await VideoAnalysisService.generateTopicBreakdown(formattedTranscript);

    return {
      summary: topics,
      videoId,
      transcriptLength: transcriptData.length,
      formattedSentences: formattedTranscript.length,
      formattedTranscript,
      transcriptSource,
    };
  }
}
