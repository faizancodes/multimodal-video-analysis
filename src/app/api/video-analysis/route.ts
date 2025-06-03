import { NextRequest, NextResponse } from "next/server";
import { VideoProcessor } from "@/services/video-processor";
import { isValidYouTubeUrl } from "@/utils/video-utils";

/**
 * POST /api/video-analysis
 * Analyzes a YouTube video and returns topic breakdown with timestamps
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { videoUrl } = body;

    // Input validation
    if (!videoUrl) {
      return NextResponse.json(
        { error: "Video URL is required" },
        { status: 400 }
      );
    }

    if (!isValidYouTubeUrl(videoUrl)) {
      return NextResponse.json(
        { error: "Invalid YouTube URL provided" },
        { status: 400 }
      );
    }

    console.log("Processing video URL:", videoUrl);

    // Process video using the main service
    const analysis = await VideoProcessor.processVideo(videoUrl);

    console.log("Video analysis completed successfully");

    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    console.error("Video analysis error:", error);

    // Handle specific error types
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    // Determine appropriate status code based on error
    const status = errorMessage.includes("Invalid YouTube URL")
      ? 400
      : errorMessage.includes("No transcript available")
        ? 404
        : errorMessage.includes("Failed to generate AI analysis")
          ? 422
          : 500;

    return NextResponse.json({ error: errorMessage }, { status });
  }
}
