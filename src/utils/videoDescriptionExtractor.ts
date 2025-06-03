import { env } from "@/app/config/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Logger } from "@/utils/logger";

const logger = new Logger("VideoDescriptionExtractor");

// Initialize Gemini AI with native SDK for video support
const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export interface VisualDescription {
  timestamp: string;
  description: string;
  startTime: number;
  endTime: number;
}

export async function extractVisualDescriptions(
  youtubeUrl: string,
  intervalSeconds: number = 30 // Extract descriptions every 30 seconds
): Promise<VisualDescription[]> {
  try {
    logger.info("Extracting visual descriptions from video", {
      youtubeUrl,
      intervalSeconds,
    });

    // Note: Custom FPS sampling can be set in video metadata if needed
    // For efficiency, we rely on Gemini's default 1 FPS sampling

    const prompt = `
You are analyzing a YouTube video to extract visual descriptions at regular intervals.

Please provide visual descriptions of what's happening in the video at key timestamps.
Focus on:
- Main visual elements, objects, people, scenes
- Actions taking place
- Text or graphics displayed on screen
- Setting/environment
- Important visual changes or transitions

For each significant visual moment, provide:
1. A clear, descriptive summary of what's visually happening
2. The approximate timestamp when this occurs

Return your response as a JSON object with this structure:
{
  "descriptions": [
    {
      "timestamp": "MM:SS or HH:MM:SS",
      "description": "Detailed visual description of what's happening at this moment"
    }
  ]
}

Make the descriptions detailed enough for someone to understand the visual content without seeing the video.
Focus on substantive visual content and avoid describing every minor detail.
`;

    // Use native Gemini SDK to properly handle YouTube URLs as file data
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        responseMimeType: "application/json", // Ensure JSON response
      },
    });

    const result = await model.generateContent([
      {
        fileData: {
          fileUri: youtubeUrl,
          mimeType: "video/mp4", // Default for YouTube videos
        },
      },
      {
        text: prompt,
      },
    ]);

    const response = result.response;
    const resultText = response.text();
    const parsedResult = JSON.parse(resultText);

    // Convert timestamps to seconds and format the response
    const descriptions: VisualDescription[] =
      parsedResult.descriptions?.map(
        (desc: { timestamp: string; description: string }) => {
          const timeInSeconds = timestampToSeconds(desc.timestamp);
          return {
            timestamp: desc.timestamp,
            description: desc.description,
            startTime: timeInSeconds,
            endTime: timeInSeconds + intervalSeconds,
          };
        }
      ) || [];

    logger.info("Visual descriptions extracted successfully", {
      count: descriptions.length,
    });

    return descriptions;
  } catch (error) {
    logger.error("Failed to extract visual descriptions", error);
    throw error;
  }
}

// Utility function to convert timestamp to seconds
function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);

  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0;
}

// Utility function to convert seconds to timestamp string
export function secondsToTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  } else {
    return `${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
}
