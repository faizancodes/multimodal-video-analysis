// Types for video chat functionality

import type { FormattedTranscriptItem } from "./video-analysis";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface VideoChatRequest {
  question: string;
  videoId: string;
  formattedTranscript: FormattedTranscriptItem[];
  chatHistory?: ChatMessage[];
}

export interface VideoChatResponse {
  answer: string;
}

export interface VideoChatContext {
  requestId: string;
  videoId: string;
  question: string;
  formattedTranscript: FormattedTranscriptItem[];
  chatHistory: ChatMessage[];
}

// Re-export for convenience
export type { FormattedTranscriptItem };
