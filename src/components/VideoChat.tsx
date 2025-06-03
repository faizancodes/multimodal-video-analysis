"use client";

import {
  useVideoChat,
  type FormattedTranscriptItem,
} from "../hooks/useVideoChat";
import { MessageContent } from "./MessageContent";
import { cn } from "@/lib/utils";

interface VideoChatProps {
  videoId: string;
  formattedTranscript: FormattedTranscriptItem[];
  onTimestampClick?: (timestamp: string) => void;
}

export function VideoChat({
  videoId,
  formattedTranscript,
  onTimestampClick,
}: VideoChatProps) {
  const { messages, inputValue, isLoading, setInputValue, handleSubmit } =
    useVideoChat({ videoId, formattedTranscript });

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6 backdrop-blur-sm">
      <h4 className="text-lg font-medium text-zinc-300 mb-6 flex items-center space-x-2">
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>Ask Questions About This Video</span>
      </h4>

      {/* Chat Messages */}
      <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar mb-6 pr-2">
        {messages.length === 0 ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.03] mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-zinc-400 text-sm max-w-sm mx-auto leading-relaxed">
              Ask any question about the video content and I&apos;ll help you
              find the answer based on the transcript.
            </p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start",
                "animate-fade-in-up"
              )}
              style={{
                animationDelay: `${index * 0.1}s`,
                opacity: 0, // Initial state before animation
              }}
            >
              <div
                className={cn(
                  "max-w-[80%] p-4 rounded-2xl shadow-lg",
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white/[0.05] text-zinc-300 border border-white/[0.05]"
                )}
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
          <div className="flex justify-start animate-fade-in">
            <div className="bg-white/[0.05] text-zinc-300 p-4 rounded-2xl border border-white/[0.05] shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce" />
                <div
                  className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                />
                <div
                  className="w-2 h-2 bg-blue-500/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex space-x-3">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder="Ask a question about the video..."
            className="flex-1 px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-sm"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 shadow-sm hover:shadow-md disabled:shadow-none"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
