// Main video chat service

import type { VideoChatResponse } from "@/types/chat";
import { getGeminiResponse } from "@/utils/geminiClient";
import { Logger } from "@/utils/logger";
import { VideoChatValidator } from "./video-chat-validation";
import { VideoChatPromptService } from "./video-chat-prompts";

const logger = new Logger("VideoChatService");

export type VideoChatServiceResult =
  | {
      success: true;
      data: VideoChatResponse;
      processingTime: number;
      aiProcessingTime: number;
    }
  | {
      success: false;
      error: string;
      processingTime: number;
    };

export class VideoChatService {
  static async processChat(
    requestBody: unknown,
    requestId: string
  ): Promise<VideoChatServiceResult> {
    const startTime = Date.now();

    try {
      // Validate input
      const validationResult = VideoChatValidator.validateRequest(
        requestBody,
        requestId
      );

      if (!validationResult.isValid) {
        const processingTime = Date.now() - startTime;
        logger.warn("❌ Validation failed", {
          requestId,
          error: validationResult.error,
          processingTime,
        });
        return {
          success: false,
          error: validationResult.error,
          processingTime,
        };
      }

      const { question, formattedTranscript, chatHistory } =
        validationResult.data;

      logger.info("📋 Processing video chat request", {
        requestId,
        questionLength: question.length,
        transcriptLength: formattedTranscript.length,
        chatHistoryLength: chatHistory?.length || 0,
      });

      // Build AI messages
      const messages = VideoChatPromptService.buildMessageHistory(
        formattedTranscript,
        chatHistory || [],
        question,
        requestId
      );

      logger.debug("📤 Sending request to Gemini AI", { requestId });

      // Get AI response
      const aiStartTime = Date.now();
      const aiResponse = await getGeminiResponse(messages);
      const aiEndTime = Date.now();
      const aiProcessingTime = aiEndTime - aiStartTime;

      logger.info("🧠 Gemini AI response received", {
        requestId,
        aiProcessingTime,
        hasResponse: !!aiResponse,
        hasAnswer: !!aiResponse?.answer,
      });

      // Extract answer
      const answer =
        aiResponse?.answer || "Sorry, I could not generate a response.";

      const totalProcessingTime = Date.now() - startTime;

      logger.info("✅ Video chat completed successfully", {
        requestId,
        totalProcessingTime,
        aiProcessingTime,
        answerLength: answer.length,
        answerPreview:
          answer.substring(0, 100) + (answer.length > 100 ? "..." : ""),
      });

      return {
        success: true,
        data: { answer },
        processingTime: totalProcessingTime,
        aiProcessingTime,
      };
    } catch (error) {
      const totalProcessingTime = Date.now() - startTime;

      logger.error("💥 Video chat service error", {
        requestId,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        processingTime: totalProcessingTime,
      });

      // Log additional error context
      if (error instanceof Error) {
        logger.debug("🔍 Error details", {
          requestId,
          errorName: error.name,
          errorMessage: error.message,
          errorCause: error.cause,
        });
      }

      return {
        success: false,
        error: "Failed to process video chat request",
        processingTime: totalProcessingTime,
      };
    }
  }

  static generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
