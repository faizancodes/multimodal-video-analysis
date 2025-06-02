import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { getGeminiResponse } from "@/utils/geminiClient";
import {
  getCachedVideoTranscript,
  cacheVideoTranscript,
} from "@/utils/redisClient";
import { formatTranscriptWithTimestamps } from "@/utils/transcriptFormatter";

// Helper function to extract video ID from YouTube URL
function extractVideoId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|m\.youtube\.com\/watch\?v=|youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const videoUrl = body.videoUrl;

    // Input validation
    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    console.log("Processing video URL:", videoUrl);

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(videoUrl);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL provided" },
        { status: 400 }
      );
    }

    console.log("Extracted video ID:", videoId);

    // Check if transcript is cached in Redis first
    let transcriptData = await getCachedVideoTranscript(videoId);

    if (!transcriptData) {
      console.log("Transcript not found in cache, fetching from YouTube...");

      // Fetch transcript from YouTube
      try {
        transcriptData = await YoutubeTranscript.fetchTranscript(videoId);

        console.log("Transcript data fetched from YouTube:", transcriptData);

        if (!transcriptData) {
          return NextResponse.json(
            { error: "No transcript available for this video" },
            { status: 404 }
          );
        }

        // Cache the transcript for future requests
        await cacheVideoTranscript(videoId, transcriptData);
        console.log("Transcript cached successfully");
      } catch (transcriptError) {
        console.error("Transcript extraction error:", transcriptError);
        return NextResponse.json(
          {
            error:
              "Failed to extract transcript from video. Video may not have captions available.",
          },
          { status: 400 }
        );
      }
    } else {
      console.log("Using cached transcript data");
    }

    // Format transcript into proper sentences with accurate timestamps
    const formattedTranscript = formatTranscriptWithTimestamps(transcriptData);
    console.log(
      "Formatted transcript into sentences:",
      formattedTranscript.length,
      "sentences"
    );

    // Generate content using the formatted transcript
    const prompt = `Based on the following formatted video transcript data, provide a breakdown of the main topics discussed in the video, with timestamps for each topic. The topics should be in the order they are discussed in the video, and should be broad enough to cover the main topics discussed in the video, not super specific ones.

        <Formatted Transcript>
          ${JSON.stringify(formattedTranscript, null, 2)}
        </Formatted Transcript>
        
        The transcript is an array of sentences with the following structure:
        {
          "text": "string (complete sentence)",
          "startTime": "number (seconds)",
          "endTime": "number (seconds)", 
          "duration": "number (seconds)",
          "formattedStartTime": "HH:MM:SS",
          "formattedEndTime": "HH:MM:SS",
          "lang": "string"
        }
        
         Generate a sequential list of topics discussed in the video, with timestamps for each high-level topic.
         Your response should be in the following JSON format:
        
          {
            "topics": [
              {
                "topic": "string",
                "timestamp": "HH:MM:SS"
              }
            ]
          }
        
         The topics should be in the order they are discussed in the video, and should be broad enough to cover the main topics discussed in the video, not super specific ones.
         The timestamps should be in the format of HH:MM:SS.
        
        `;

    // Initialize Gemini AI
    const sectionBreakdown = await getGeminiResponse([
      { role: "user", content: prompt },
    ]);

    const analysis = sectionBreakdown.topics;

    console.log("Analysis generated successfully");

    return NextResponse.json(
      {
        summary: analysis,
        videoId: videoId,
        transcriptLength: transcriptData.length,
        formattedSentences: formattedTranscript.length,
        formattedTranscript: formattedTranscript, // Include formatted transcript in response
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Video analysis error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
