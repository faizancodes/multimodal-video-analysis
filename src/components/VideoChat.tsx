"use client";

import {
  useVideoChat,
  type FormattedTranscriptItem,
} from "../hooks/useVideoChat";
import { MessageContent } from "./MessageContent";

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
