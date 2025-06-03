import { YoutubeTranscript } from "youtube-transcript";
import { env } from "@/app/config/env";
import type {
  TranscriptItem,
  FallbackAPIResponse,
  FallbackTranscriptItem,
} from "@/types/video-analysis";

/**
 * Service for fetching video transcripts from multiple sources
 */
export class TranscriptService {
  /**
   * Transform fallback API response to expected format
   */
  private static transformFallbackResponse(
    fallbackData: FallbackAPIResponse[]
  ): TranscriptItem[] {
    if (!fallbackData || fallbackData.length === 0) {
      return [];
    }

    // Get the first video's transcription (API returns array but we're processing one video)
    const videoData = fallbackData[0];
    if (!videoData || !videoData.transcription) {
      return [];
    }

    return videoData.transcription.map((item: FallbackTranscriptItem) => ({
      text: item.subtitle,
      duration: item.dur,
      offset: item.start,
      lang: "en", // Default to English, could be made dynamic based on availableLangs
    }));
  }

  /**
   * Fetch transcript using RapidAPI fallback service
   */
  private static async fetchFromFallbackAPI(
    videoId: string
  ): Promise<TranscriptItem[] | null> {
    const url = `https://youtube-transcriptor.p.rapidapi.com/transcript?video_id=${videoId}&lang=en`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": env.RAPID_API_KEY,
        "x-rapidapi-host": "youtube-transcriptor.p.rapidapi.com",
      },
    };

    try {
      console.log("Attempting fallback API for video ID:", videoId);
      const response = await fetch(url, options);

      if (!response.ok) {
        console.error(
          "Fallback API response not ok:",
          response.status,
          response.statusText
        );
        return null;
      }

      const result = await response.json();
      console.log("Fallback API response received");

      // Transform the response to expected format
      const transformedData = this.transformFallbackResponse(result);

      if (transformedData.length === 0) {
        console.log("No transcription data found in fallback API response");
        return null;
      }

      console.log(
        "Successfully transformed fallback API data:",
        transformedData.length,
        "items"
      );
      return transformedData;
    } catch (error) {
      console.error("Fallback API error:", error);
      return null;
    }
  }

  /**
   * Fetch transcript directly from YouTube
   */
  private static async fetchFromYouTube(
    videoId: string
  ): Promise<TranscriptItem[] | null> {
    try {
      console.log("Fetching transcript from YouTube for video ID:", videoId);
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

      if (!transcriptData || transcriptData.length === 0) {
        console.log("No transcript data from YouTube");
        return null;
      }

      console.log(
        "Transcript data fetched from YouTube:",
        transcriptData.length,
        "items"
      );
      return transcriptData;
    } catch (error) {
      console.error("YouTube transcript extraction error:", error);
      return null;
    }
  }

  /**
   * Fetch transcript with fallback strategy
   * Tries YouTube first, then fallback API
   */
  static async fetchTranscript(videoId: string): Promise<{
    transcript: TranscriptItem[];
    source: "youtube-direct" | "fallback-api";
  } | null> {
    // Try YouTube first
    let transcript = await this.fetchFromYouTube(videoId);

    if (transcript && transcript.length > 0) {
      return {
        transcript,
        source: "youtube-direct",
      };
    }

    // Try fallback API
    console.log("Trying fallback API due to YouTube failure...");
    transcript = await this.fetchFromFallbackAPI(videoId);

    if (transcript && transcript.length > 0) {
      return {
        transcript,
        source: "fallback-api",
      };
    }

    // Both sources failed
    return null;
  }
}
