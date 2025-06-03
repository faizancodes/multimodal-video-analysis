"use client";

import { useState } from "react";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface FormattedTranscriptItem {
  text: string;
  startTime: number;
  endTime: number;
  duration: number;
  formattedStartTime: string;
  formattedEndTime: string;
  lang?: string;
}

interface VideoChatProps {
  videoId: string;
  formattedTranscript: FormattedTranscriptItem[];
  onTimestampClick?: (timestamp: string) => void;
}

// Utility function to convert timestamp (MM:SS or HH:MM:SS) to seconds
function timestampToSeconds(timestamp: string): number {
  const parts = timestamp.split(":").map(Number);

  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0; // fallback
}

// Generate YouTube URL with timestamp
function getYouTubeUrlWithTimestamp(
  videoId: string,
  timestamp: string
): string {
  const seconds = timestampToSeconds(timestamp);
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
}

// Format timestamp for display by removing unnecessary "00:" hour component
function formatTimestampForDisplay(timestamp: string): string {
  // Handle time ranges
  if (timestamp.includes("-")) {
    const [start, end] = timestamp.split("-");
    const formattedStart = start.startsWith("00:") ? start.slice(3) : start;
    const formattedEnd = end.startsWith("00:") ? end.slice(3) : end;
    return `${formattedStart}-${formattedEnd}`;
  }

  // Handle single timestamps
  return timestamp.startsWith("00:") ? timestamp.slice(3) : timestamp;
}

// Component to render message content with clickable timestamps
function MessageContent({
  content,
  videoId,
  onTimestampClick,
}: {
  content: string;
  videoId: string;
  onTimestampClick?: (timestamp: string) => void;
}) {
  const handleTimestampClick = (timestamp: string) => {
    // Extract start time if it's a range (e.g., "00:02:40-00:02:49" -> "00:02:40")
    const startTime = timestamp.includes("-")
      ? timestamp.split("-")[0]
      : timestamp;

    if (onTimestampClick) {
      onTimestampClick(startTime);
    } else {
      // Fallback to opening in new tab
      const youtubeUrl = getYouTubeUrlWithTimestamp(videoId, startTime);
      window.open(youtubeUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Regex to match timestamps in format [HH:MM:SS], [MM:SS], or time ranges [HH:MM:SS-HH:MM:SS], [MM:SS-MM:SS]
  const timestampRegex =
    /\[(\d{1,2}:\d{2}(?::\d{2})?(?:-\d{1,2}:\d{2}(?::\d{2})?)?)\]/g;

  // Split content by timestamps and create clickable elements
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = timestampRegex.exec(content)) !== null) {
    // Add text before timestamp
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add clickable timestamp or time range
    const timestamp = match[1];
    const isRange = timestamp.includes("-");

    parts.push(
      <button
        key={`${match.index}-${timestamp}`}
        onClick={() => handleTimestampClick(timestamp)}
        className="inline-block px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-mono rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-zinc-900 mx-1"
        title={
          isRange
            ? `Click to jump to ${formatTimestampForDisplay(timestamp.split("-")[0])} (start of time range)`
            : `Click to jump to ${formatTimestampForDisplay(timestamp)} in the video`
        }
      >
        {formatTimestampForDisplay(timestamp)}
      </button>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <span className="whitespace-pre-wrap">{parts}</span>;
}

export function VideoChat({
  videoId,
  formattedTranscript,
  onTimestampClick,
}: VideoChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/video-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: inputValue,
          videoId,
          formattedTranscript,
          chatHistory: messages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Sorry, I encountered an error while processing your question. Please try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6">
      <h4 className="text-lg font-medium text-zinc-300 mb-4">
        Ask Questions About This Video
      </h4>

      {/* Chat Messages */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-zinc-500 text-sm">
              Ask any question about the video content and I&apos;ll help you
              find the answer based on the transcript.
            </p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] p-3 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white/[0.05] text-zinc-300"
                }`}
              >
                <div className="text-sm">
                  {message.role === "assistant" ? (
                    <MessageContent
                      content={message.content}
                      videoId={videoId}
                      onTimestampClick={onTimestampClick}
                    />
                  ) : (
                    <span className="whitespace-pre-wrap">
                      {message.content}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/[0.05] text-zinc-300 p-3 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask a question about the video..."
            className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
