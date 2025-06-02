import { NextRequest, NextResponse } from "next/server";
import { getGeminiResponse } from "@/utils/geminiClient";
import { Logger } from "@/utils/logger";

const logger = new Logger("VideoChat");

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  logger.info("🚀 Video chat request started", { requestId });

  try {
    // Parse request body
    logger.debug("📝 Parsing request body", { requestId });
    const body = await request.json();
    const { question, videoId, formattedTranscript, chatHistory } = body;

    logger.info("📋 Request details", {
      requestId,
      videoId,
      hasQuestion: !!question,
      questionLength: question?.length || 0,
      hasTranscript: !!formattedTranscript,
      transcriptLength: Array.isArray(formattedTranscript)
        ? formattedTranscript.length
        : 0,
      hasChatHistory: !!chatHistory,
      chatHistoryLength: Array.isArray(chatHistory) ? chatHistory.length : 0,
    });

    // Input validation
    logger.debug("🔍 Starting input validation", { requestId });

    if (!question) {
      logger.warn("❌ Validation failed: Missing question", { requestId });
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    if (!formattedTranscript || !Array.isArray(formattedTranscript)) {
      logger.warn("❌ Validation failed: Invalid transcript", {
        requestId,
        hasTranscript: !!formattedTranscript,
        isArray: Array.isArray(formattedTranscript),
      });
      return NextResponse.json(
        { error: "Video transcript is required" },
        { status: 400 }
      );
    }

    logger.info("✅ Input validation passed", {
      requestId,
      questionPreview:
        question.substring(0, 100) + (question.length > 100 ? "..." : ""),
      transcriptSentences: formattedTranscript.length,
    });

    // Build context from chat history
    logger.debug("🔨 Building chat context", { requestId });
    let chatContext = "";
    if (chatHistory && chatHistory.length > 0) {
      chatContext = "\n\nPrevious conversation:\n";
      chatHistory.forEach((msg: ChatMessage) => {
        chatContext += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
      });
      logger.debug("💬 Chat context built", {
        requestId,
        contextLength: chatContext.length,
        historyMessages: chatHistory.length,
      });
    } else {
      logger.debug("💬 No chat history provided", { requestId });
    }

    // Create a comprehensive prompt for the AI
    logger.debug("📝 Creating AI prompt", { requestId });
    const prompt = `You are an AI assistant helping users understand a YouTube video by answering questions based on its transcript. 

<Video Transcript>
${JSON.stringify(formattedTranscript, null, 2)}
</Video Transcript>

The transcript is formatted as an array of sentences with the following structure:
{
  "text": "string (complete sentence)",
  "startTime": "number (seconds)",
  "endTime": "number (seconds)", 
  "duration": "number (seconds)",
  "formattedStartTime": "HH:MM:SS",
  "formattedEndTime": "HH:MM:SS",
  "lang": "string"
}

Instructions:
1. Answer the user's question based ONLY on the information available in the video transcript
2. If the answer involves specific content from the video, include relevant timestamps in the format [HH:MM:SS] 
3. If the question cannot be answered from the transcript, politely say so and suggest what information is available
4. Keep your responses conversational and helpful
5. When referencing specific parts of the video, include the timestamp for context
6. If there are multiple relevant sections, mention the key timestamps

Please respond with a JSON object in the following format:
{
  "answer": "Your detailed answer to the user's question"
}`;

    const messages = [
      { role: "system", content: prompt },
      ...chatHistory.map((msg: ChatMessage) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: "user", content: "Here is my question: " + question },
    ];

    logger.info("🤖 Prepared messages for AI", {
      requestId,
      messageCount: messages.length,
      promptLength: prompt.length,
      systemMessageLength: messages[0].content.length,
    });

    logger.debug("📤 Sending request to Gemini AI", { requestId });

    // Get response from Gemini AI
    const aiStartTime = Date.now();
    const response = await getGeminiResponse(messages);
    const aiEndTime = Date.now();
    const aiDuration = aiEndTime - aiStartTime;

    logger.info("🧠 Gemini AI response received", {
      requestId,
      aiProcessingTime: aiDuration,
      hasResponse: !!response,
      hasAnswer: !!response?.answer,
    });

    // Extract the answer from the response
    const answer = response.answer || "Sorry, I could not generate a response.";

    const totalDuration = Date.now() - startTime;

    logger.info("✅ Video chat completed successfully", {
      requestId,
      totalProcessingTime: totalDuration,
      aiProcessingTime: aiDuration,
      answerLength: answer.length,
      answerPreview:
        answer.substring(0, 100) + (answer.length > 100 ? "..." : ""),
    });

    return NextResponse.json({ answer }, { status: 200 });
  } catch (error) {
    const totalDuration = Date.now() - startTime;

    logger.error("💥 Video chat error occurred", {
      requestId,
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      processingTime: totalDuration,
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

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
