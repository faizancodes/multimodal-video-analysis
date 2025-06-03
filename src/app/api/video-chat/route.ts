import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/utils/logger";
import { VideoChatService } from "@/services/video-chat";

const logger = new Logger("VideoChatAPI");

export async function POST(request: NextRequest) {
  const requestId = VideoChatService.generateRequestId();

  logger.info("🚀 Video chat API request started", { requestId });

  try {
    // Parse request body
    logger.debug("📝 Parsing request body", { requestId });
    const body = await request.json();

    logger.info("📋 API request received", {
      requestId,
      hasBody: !!body,
    });

    // Process the chat request using the service
    const result = await VideoChatService.processChat(body, requestId);

    if (result.success) {
      logger.info("✅ Video chat API completed successfully", {
        requestId,
        totalProcessingTime: result.processingTime,
        aiProcessingTime: result.aiProcessingTime,
      });

      return NextResponse.json(result.data, { status: 200 });
    } else {
      logger.warn("⚠️ Video chat API validation/processing failed", {
        requestId,
        error: result.error,
        processingTime: result.processingTime,
      });

      return NextResponse.json({ error: result.error }, { status: 400 });
    }
  } catch (error) {
    logger.error("💥 Video chat API error occurred", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
