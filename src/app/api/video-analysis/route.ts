import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";


export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    const videoUrl = body.videoUrl;
    console.log(videoUrl);

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent([
      "Please summarize the video in 3 sentences.",
      {
        fileData: {
          fileUri: videoUrl,
          mimeType: "video/mp4",
        },
      },
    ]);
    console.log(result);
    console.log(result.response.text());

    // TODO: Add input validation here
    // Example: validate required fields like video file, analysis type, etc.
    if (!body) {
      return NextResponse.json(
        { error: "Request body is required" },
        { status: 400 }
      );
    }

    // TODO: Add video analysis logic here
    // This could include:
    // - File upload handling
    // - Video processing
    // - AI/ML analysis
    // - Database operations

    // Placeholder response

    return NextResponse.json(result.response.text(), { status: 200 });
  } catch (error) {
    console.error("Video analysis error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
