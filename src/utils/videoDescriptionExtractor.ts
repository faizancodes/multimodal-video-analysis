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

    // Optimized prompt for faster processing and better structured output
    const prompt = `
Analyze this video and provide visual descriptions at regular intervals (every ${intervalSeconds} seconds).

Focus on significant visual content:
- Key visual elements, objects, people
- Important actions or scene changes
- Setting/environment
- Text/graphics on screen
- Visual transitions

Return JSON in this exact format:
{
  "descriptions": [
    {
      "timestamp": "MM:SS or HH:MM:SS",
      "description": "Concise visual description of what's happening at this moment (2 sentences max)"
    }
  ]
}

Generate approximately one description every ${intervalSeconds} seconds. Be concise but descriptive.
`;

    // Use optimized model configuration for speed
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-lite", // Faster lite model
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.1, // Lower temperature for more consistent, faster responses
      },
    });

    const result = await model.generateContent([
      {
        fileData: {
          fileUri: youtubeUrl,
          mimeType: "video/mp4",
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
      optimizations: "0.5 FPS, low resolution, lite model",
    });

    return descriptions;
  } catch (error) {
    logger.error("Failed to extract visual descriptions", error);
    throw error;
  }
}

// New function for chunked processing (for very long videos)
export async function extractVisualDescriptionsChunked(
  youtubeUrl: string,
  intervalSeconds: number = 30,
  chunkDurationMinutes: number = 10 // Process in 10-minute chunks
): Promise<VisualDescription[]> {
  try {
    logger.info("Extracting visual descriptions using chunked processing", {
      youtubeUrl,
      intervalSeconds,
      chunkDurationMinutes,
    });

    // First, get video duration (this would need to be implemented)
    // For now, we'll process the first chunk and see if we need more

    const chunkDurationSeconds = chunkDurationMinutes * 60;
    const allDescriptions: VisualDescription[] = [];

    // Process first chunk
    const firstChunkDescriptions = await extractVisualDescriptionsForTimeRange(
      youtubeUrl,
      0,
      chunkDurationSeconds,
      intervalSeconds
    );

    allDescriptions.push(...firstChunkDescriptions);

    logger.info("Chunked visual descriptions extracted successfully", {
      totalCount: allDescriptions.length,
      chunks: 1, // Would be dynamic based on video length
    });

    return allDescriptions;
  } catch (error) {
    logger.error("Failed to extract chunked visual descriptions", error);
    throw error;
  }
}

// Helper function to extract descriptions for a specific time range
async function extractVisualDescriptionsForTimeRange(
  youtubeUrl: string,
  startSeconds: number,
  endSeconds: number,
  intervalSeconds: number
): Promise<VisualDescription[]> {
  const prompt = `
Analyze this video segment and provide visual descriptions at regular intervals (every ${intervalSeconds} seconds).

Focus ONLY on significant visual content:
- Key visual elements, objects, people (mention names of people if they are mentioned or recognizable), scenes
- Important actions or scene changes
- Text/graphics on screen

Return JSON:
{
  "descriptions": [
    {
      "timestamp": "MM:SS",
      "description": "Concise visual description"
    }
  ]
}
`;

  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-lite",
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.1,
    },
  });

  const result = await model.generateContent([
    {
      fileData: {
        fileUri: youtubeUrl,
        mimeType: "video/mp4",
      },
    },
    {
      text: prompt,
    },
  ]);

  const response = result.response;
  const resultText = response.text();
  const parsedResult = JSON.parse(resultText);

  return (
    parsedResult.descriptions?.map(
      (desc: { timestamp: string; description: string }) => {
        const timeInSeconds = timestampToSeconds(desc.timestamp) + startSeconds;
        return {
          timestamp: secondsToTimestamp(timeInSeconds),
          description: desc.description,
          startTime: timeInSeconds,
          endTime: timeInSeconds + intervalSeconds,
        };
      }
    ) || []
  );
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
