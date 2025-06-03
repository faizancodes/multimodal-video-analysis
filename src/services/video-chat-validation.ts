// Validation service for video chat functionality

import type { VideoChatRequest } from "@/types/chat";
import { Logger } from "@/utils/logger";

const logger = new Logger("VideoChatValidation");

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  details?: Record<string, unknown>;
}

export class VideoChatValidator {
  static validateRequest(
    body: unknown,
    requestId: string
  ):
    | { isValid: true; data: VideoChatRequest }
    | { isValid: false; error: string } {
    logger.debug("🔍 Starting input validation", { requestId });

    // Type guard for basic object structure
    if (!body || typeof body !== "object") {
      logger.warn("❌ Validation failed: Invalid request body", { requestId });
      return { isValid: false, error: "Invalid request body" };
    }

    const data = body as Partial<VideoChatRequest>;

    // Validate question
    if (!data.question || typeof data.question !== "string") {
      logger.warn("❌ Validation failed: Missing or invalid question", {
        requestId,
      });
      return {
        isValid: false,
        error: "Question is required and must be a string",
      };
    }

    // Validate videoId
    if (!data.videoId || typeof data.videoId !== "string") {
      logger.warn("❌ Validation failed: Missing or invalid videoId", {
        requestId,
      });
      return {
        isValid: false,
        error: "Video ID is required and must be a string",
      };
    }

    // Validate formattedTranscript
    if (!data.formattedTranscript || !Array.isArray(data.formattedTranscript)) {
      logger.warn("❌ Validation failed: Invalid transcript", {
        requestId,
        hasTranscript: !!data.formattedTranscript,
        isArray: Array.isArray(data.formattedTranscript),
      });
      return {
        isValid: false,
        error: "Video transcript is required and must be an array",
      };
    }

    // Validate transcript items structure
    if (data.formattedTranscript.length === 0) {
      logger.warn("❌ Validation failed: Empty transcript", { requestId });
      return { isValid: false, error: "Video transcript cannot be empty" };
    }

    // Validate chat history if provided
    if (data.chatHistory && !Array.isArray(data.chatHistory)) {
      logger.warn("❌ Validation failed: Invalid chat history", { requestId });
      return { isValid: false, error: "Chat history must be an array" };
    }

    // Type assertion is safe here since we've validated all required fields
    const validatedData: VideoChatRequest = {
      question: data.question,
      videoId: data.videoId,
      formattedTranscript: data.formattedTranscript,
      chatHistory: data.chatHistory || [],
    };

    logger.info("✅ Input validation passed", {
      requestId,
      questionPreview:
        validatedData.question.substring(0, 100) +
        (validatedData.question.length > 100 ? "..." : ""),
      transcriptSentences: validatedData.formattedTranscript.length,
      chatHistoryLength: validatedData.chatHistory?.length || 0,
    });

    return { isValid: true, data: validatedData };
  }

  static validateTranscriptItem(item: unknown): boolean {
    if (!item || typeof item !== "object") return false;

    const transcriptItem = item as Record<string, unknown>;

    return (
      typeof transcriptItem.text === "string" &&
      typeof transcriptItem.startTime === "number" &&
      typeof transcriptItem.endTime === "number" &&
      typeof transcriptItem.duration === "number"
    );
  }
}
