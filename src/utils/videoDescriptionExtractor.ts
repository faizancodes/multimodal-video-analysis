import { env } from "@/app/config/env";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Logger } from "@/utils/logger";
import { extractVideoId } from "@/utils/video-utils";
import {
  getCachedVideoDescriptions,
  cacheVideoDescriptions,
  getCachedVideoDescriptionsChunked,
  cacheVideoDescriptionsChunked,
  getCachedVideoDescriptionsTimeRange,
  cacheVideoDescriptionsTimeRange,
} from "@/utils/redisClient";

const logger = new Logger("VideoDescriptionExtractor");

// Initialize Gemini AI with native SDK for video support
const genAI = new GoogleGenerativeAI(env.GOOGLE_API_KEY);

export interface VisualDescription {
  timestamp: string;
  description: string;
  startTime: number;
  endTime: number;
}

// Helper function to safely parse JSON with fallback handling
function safeJsonParse(text: string): any {
  // Log the exact text we're trying to parse for debugging
  logger.info("Attempting to parse JSON response", {
    textLength: text.length,
    textPreview: text.substring(0, 300),
    textSuffix: text.substring(Math.max(0, text.length - 100)),
  });

  try {
    // First attempt: direct parsing
    const parsed = JSON.parse(text);
    logger.info("Successfully parsed JSON on first attempt");
    return parsed;
  } catch (error) {
    logger.warn("Initial JSON parse failed, attempting to clean response", {
      error: error instanceof Error ? error.message : String(error),
      parseErrorDetails: error,
    });

    try {
      // Second attempt: clean the text and try again
      let cleanedText = text.trim();

      // Remove any markdown code blocks if present
      cleanedText = cleanedText
        .replace(/^```json\s*/i, "")
        .replace(/\s*```$/, "");
      cleanedText = cleanedText.replace(/^```\s*/, "").replace(/\s*```$/, "");

      // Remove any trailing commas before closing braces/brackets
      cleanedText = cleanedText.replace(/,(\s*[}\]])/g, "$1");

      // Fix missing closing braces - this is a common issue with AI responses
      // Check if we have a description field followed directly by array closing
      // Pattern: "description": "some text with period."\n  ]\n}
      // Should be: "description": "some text with period."\n    }\n  ]\n}

      // Simple approach: if we see a quote followed by whitespace and ] without a }, add the }
      if (
        cleanedText.includes('"description":') &&
        /"\s*\n\s*\]/.test(cleanedText)
      ) {
        cleanedText = cleanedText.replace(/"\s*\n\s*\]/g, '"\n    }\n  ]');
        logger.info("Applied missing closing brace fix");
      }

      // Only fix unquoted keys (be more careful with regex)
      // This regex only matches unquoted alphanumeric keys, not already quoted ones
      cleanedText = cleanedText.replace(
        /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
        '$1"$2":'
      );

      // Replace single quotes with double quotes, but only for string values
      cleanedText = cleanedText.replace(/:\s*'([^']*)'/g, ': "$1"');

      logger.info("Attempting to parse cleaned JSON", {
        cleanedTextPreview: cleanedText.substring(0, 300),
      });

      const parsed = JSON.parse(cleanedText);
      logger.info("Successfully parsed JSON after cleaning");
      return parsed;
    } catch (secondError) {
      logger.warn("Second JSON parse attempt failed, trying regex extraction", {
        secondError:
          secondError instanceof Error
            ? secondError.message
            : String(secondError),
      });

      try {
        // Third attempt: extract JSON from response using regex
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let extractedJson = jsonMatch[0];

          logger.info("Extracted JSON using regex", {
            extractedPreview: extractedJson.substring(0, 300),
          });

          // Clean extracted JSON - be more careful here too
          extractedJson = extractedJson.replace(/,(\s*[}\]])/g, "$1");

          // Fix missing closing braces in extracted JSON too
          if (
            extractedJson.includes('"description":') &&
            /"\s*\n\s*\]/.test(extractedJson)
          ) {
            extractedJson = extractedJson.replace(
              /"\s*\n\s*\]/g,
              '"\n    }\n  ]'
            );
            logger.info("Applied missing closing brace fix to extracted JSON");
          }

          extractedJson = extractedJson.replace(
            /([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g,
            '$1"$2":'
          );
          extractedJson = extractedJson.replace(/:\s*'([^']*)'/g, ': "$1"');

          const parsed = JSON.parse(extractedJson);
          logger.info("Successfully parsed extracted JSON");
          return parsed;
        }

        throw new Error("No valid JSON found in response");
      } catch (thirdError) {
        logger.error("All JSON parsing attempts failed", {
          originalText: text.substring(0, 500),
          thirdError:
            thirdError instanceof Error
              ? thirdError.message
              : String(thirdError),
          allAttemptsMade: "direct parse, cleaned parse, regex extraction",
        });

        // Final fallback: return a minimal valid structure
        return {
          descriptions: [
            {
              timestamp: "00:00",
              description:
                "Unable to parse video descriptions due to malformed response",
            },
          ],
        };
      }
    }
  }
}

// Helper function to validate and sanitize descriptions
function validateDescriptions(descriptions: any[]): VisualDescription[] {
  if (!Array.isArray(descriptions)) {
    logger.warn("Descriptions is not an array, returning empty array");
    return [];
  }

  return descriptions
    .filter(desc => {
      return (
        desc &&
        typeof desc.timestamp === "string" &&
        typeof desc.description === "string" &&
        desc.timestamp.trim() !== "" &&
        desc.description.trim() !== ""
      );
    })
    .map(desc => ({
      timestamp: desc.timestamp.trim(),
      description: desc.description.trim(),
      startTime: 0, // Will be calculated later
      endTime: 0, // Will be calculated later
    }));
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

    // Extract video ID for caching
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL provided");
    }

    // Check cache first
    const cachedDescriptions = await getCachedVideoDescriptions(
      videoId,
      intervalSeconds
    );
    if (cachedDescriptions) {
      logger.info("Found cached video descriptions", {
        videoId,
        count: cachedDescriptions.length,
        intervalSeconds,
      });
      return cachedDescriptions;
    }

    logger.info("No cached descriptions found, generating new ones", {
      videoId,
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

IMPORTANT: Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "descriptions": [
    {
      "timestamp": "MM:SS",
      "description": "Concise visual description of what's happening at this moment"
    }
  ]
}

Generate approximately one description every ${intervalSeconds} seconds. Be concise but descriptive.
Use ONLY double quotes for JSON strings. Ensure all JSON syntax is valid.
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

    logger.info("Raw response received", {
      responseLength: resultText.length,
      responsePreview: resultText.substring(0, 200),
      responseSuffix: resultText.substring(
        Math.max(0, resultText.length - 100)
      ),
      fullResponse: resultText, // Add full response for debugging
    });

    // Use safe JSON parsing with fallback handling
    const parsedResult = safeJsonParse(resultText);

    logger.info("JSON parsing completed", {
      parsedResultType: typeof parsedResult,
      hasDescriptions: !!parsedResult.descriptions,
      descriptionsCount: Array.isArray(parsedResult.descriptions)
        ? parsedResult.descriptions.length
        : 0,
    });

    // Validate and sanitize the descriptions
    const rawDescriptions = parsedResult.descriptions || [];
    const validatedDescriptions = validateDescriptions(rawDescriptions);

    if (validatedDescriptions.length === 0) {
      logger.warn("No valid descriptions found in response");
      return [];
    }

    // Convert timestamps to seconds and format the response
    const descriptions: VisualDescription[] = validatedDescriptions.map(
      desc => {
        const timeInSeconds = timestampToSeconds(desc.timestamp);
        return {
          timestamp: desc.timestamp,
          description: desc.description,
          startTime: timeInSeconds,
          endTime: timeInSeconds + intervalSeconds,
        };
      }
    );

    // Cache the descriptions for future use (fire and forget)
    cacheVideoDescriptions(videoId, intervalSeconds, descriptions).catch(
      error => {
        logger.warn("Failed to cache video descriptions (non-critical)", {
          videoId,
          error,
        });
      }
    );

    logger.info("Visual descriptions extracted successfully", {
      videoId,
      count: descriptions.length,
      intervalSeconds,
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

    // Extract video ID for caching
    const videoId = extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error("Invalid YouTube URL provided");
    }

    // Check cache first
    const cachedDescriptions = await getCachedVideoDescriptionsChunked(
      videoId,
      intervalSeconds,
      chunkDurationMinutes
    );
    if (cachedDescriptions) {
      logger.info("Found cached chunked video descriptions", {
        videoId,
        count: cachedDescriptions.length,
        intervalSeconds,
        chunkDurationMinutes,
      });
      return cachedDescriptions;
    }

    logger.info("No cached chunked descriptions found, generating new ones", {
      videoId,
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

    // Cache the chunked descriptions for future use (fire and forget)
    cacheVideoDescriptionsChunked(
      videoId,
      intervalSeconds,
      chunkDurationMinutes,
      allDescriptions
    ).catch(error => {
      logger.warn("Failed to cache chunked video descriptions (non-critical)", {
        videoId,
        error,
      });
    });

    logger.info("Chunked visual descriptions extracted successfully", {
      videoId,
      totalCount: allDescriptions.length,
      chunks: 1, // Would be dynamic based on video length
      intervalSeconds,
      chunkDurationMinutes,
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
  // Extract video ID for caching
  const videoId = extractVideoId(youtubeUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL provided");
  }

  // Check cache first
  const cachedDescriptions = await getCachedVideoDescriptionsTimeRange(
    videoId,
    startSeconds,
    endSeconds,
    intervalSeconds
  );
  if (cachedDescriptions) {
    logger.info("Found cached time range video descriptions", {
      videoId,
      count: cachedDescriptions.length,
      startSeconds,
      endSeconds,
      intervalSeconds,
    });
    return cachedDescriptions;
  }

  logger.info("No cached time range descriptions found, generating new ones", {
    videoId,
    startSeconds,
    endSeconds,
    intervalSeconds,
  });

  const prompt = `
Analyze this video segment and provide visual descriptions at regular intervals (every ${intervalSeconds} seconds).

Focus ONLY on significant visual content:
- Key visual elements, objects, people (mention names of people if they are mentioned or recognizable), scenes
- Important actions or scene changes
- Text/graphics on screen

IMPORTANT: Return ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "descriptions": [
    {
      "timestamp": "MM:SS",
      "description": "Concise visual description"
    }
  ]
}

Use ONLY double quotes for JSON strings. Ensure all JSON syntax is valid.
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

  logger.info("Raw response received for time range", {
    responseLength: resultText.length,
    responsePreview: resultText.substring(0, 200),
    responseSuffix: resultText.substring(Math.max(0, resultText.length - 100)),
    startSeconds,
    endSeconds,
    fullResponse: resultText, // Add full response for debugging
  });

  // Use safe JSON parsing with fallback handling
  const parsedResult = safeJsonParse(resultText);

  logger.info("JSON parsing completed for time range", {
    parsedResultType: typeof parsedResult,
    hasDescriptions: !!parsedResult.descriptions,
    descriptionsCount: Array.isArray(parsedResult.descriptions)
      ? parsedResult.descriptions.length
      : 0,
    startSeconds,
    endSeconds,
  });

  // Validate and sanitize the descriptions
  const rawDescriptions = parsedResult.descriptions || [];
  const validatedDescriptions = validateDescriptions(rawDescriptions);

  if (validatedDescriptions.length === 0) {
    logger.warn("No valid descriptions found in time range response");
    return [];
  }

  const descriptions = validatedDescriptions.map(desc => {
    const timeInSeconds = timestampToSeconds(desc.timestamp) + startSeconds;
    return {
      timestamp: secondsToTimestamp(timeInSeconds),
      description: desc.description,
      startTime: timeInSeconds,
      endTime: timeInSeconds + intervalSeconds,
    };
  });

  // Cache the time range descriptions for future use (fire and forget)
  cacheVideoDescriptionsTimeRange(
    videoId,
    startSeconds,
    endSeconds,
    intervalSeconds,
    descriptions
  ).catch(error => {
    logger.warn(
      "Failed to cache time range video descriptions (non-critical)",
      {
        videoId,
        startSeconds,
        endSeconds,
        error,
      }
    );
  });

  logger.info("Time range visual descriptions extracted successfully", {
    videoId,
    count: descriptions.length,
    startSeconds,
    endSeconds,
    intervalSeconds,
  });

  return descriptions;
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
