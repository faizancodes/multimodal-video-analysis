// Prompt service for video chat functionality

import type { ChatMessage, FormattedTranscriptItem } from "@/types/chat";
import { Logger } from "@/utils/logger";

const logger = new Logger("VideoChatPrompts");

export interface PromptMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export class VideoChatPromptService {
  static createSystemPrompt(
    formattedTranscript: FormattedTranscriptItem[]
  ): string {
    logger.debug("📝 Creating system prompt", {
      transcriptLength: formattedTranscript.length,
    });

    return `You are an AI assistant helping users understand a YouTube video by answering questions based on its transcript. 

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
  }

  static createChatHistory(chatHistory: ChatMessage[]): PromptMessage[] {
    logger.debug("💬 Processing chat history", {
      historyLength: chatHistory.length,
    });

    return chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));
  }

  static createUserMessage(question: string): PromptMessage {
    logger.debug("👤 Creating user message", {
      questionLength: question.length,
      questionPreview:
        question.substring(0, 50) + (question.length > 50 ? "..." : ""),
    });

    return {
      role: "user",
      content: `Here is my question: ${question}`,
    };
  }

  static buildMessageHistory(
    formattedTranscript: FormattedTranscriptItem[],
    chatHistory: ChatMessage[],
    question: string,
    requestId: string
  ): PromptMessage[] {
    logger.debug("🔨 Building complete message history", { requestId });

    const systemPrompt = this.createSystemPrompt(formattedTranscript);
    const historyMessages = this.createChatHistory(chatHistory);
    const userMessage = this.createUserMessage(question);

    const messages: PromptMessage[] = [
      { role: "system", content: systemPrompt },
      ...historyMessages,
      userMessage,
    ];

    logger.info("🤖 Prepared messages for AI", {
      requestId,
      messageCount: messages.length,
      promptLength: systemPrompt.length,
      systemMessageLength: messages[0].content.length,
      historyMessageCount: historyMessages.length,
    });

    return messages;
  }

  static buildChatContext(chatHistory: ChatMessage[]): string {
    logger.debug("🔨 Building chat context", {
      historyLength: chatHistory.length,
    });

    if (!chatHistory || chatHistory.length === 0) {
      logger.debug("💬 No chat history provided");
      return "";
    }

    let chatContext = "\n\nPrevious conversation:\n";
    chatHistory.forEach(msg => {
      chatContext += `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}\n`;
    });

    logger.debug("💬 Chat context built", {
      contextLength: chatContext.length,
      historyMessages: chatHistory.length,
    });

    return chatContext;
  }
}
