"use client";

import { useState } from "react";
import { SectionBreakdownLoadingSkeleton } from "@/components/section-breakdown-skeleton";
import { VideoChat } from "@/components/VideoChat";
import { VideoSearch } from "@/components/VideoSearch";

// Type definitions for the API response
interface Topic {
  topic: string;
  timestamp: string;
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

interface AnalysisResponse {
  summary: Topic[];
  videoId: string;
  transcriptLength: number;
  formattedTranscript?: FormattedTranscriptItem[];
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

export function YouTubeInput() {
  const [videoUrl, setVideoUrl] = useState("");
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(
    null
  );
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!videoUrl.trim()) return;

    setIsLoading(true);
    setError("");
    setAnalysisData(null);

    try {
      const response = await fetch("/api/video-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoUrl }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "An error occurred while analyzing the video.");
        return;
      }

      setAnalysisData(data);
    } catch (error) {
      console.error("Error analyzing video:", error);
      setError(
        "An error occurred while analyzing the video. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimestampClick = (timestamp: string) => {
    if (analysisData?.videoId) {
      const youtubeUrl = getYouTubeUrlWithTimestamp(
        analysisData.videoId,
        timestamp
      );
      window.open(youtubeUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="youtube-url"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            YouTube Video URL
          </label>
          <input
            id="youtube-url"
            type="url"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!videoUrl.trim() || isLoading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          {isLoading ? "Analyzing..." : "Analyze Video"}
        </button>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <SectionBreakdownLoadingSkeleton />
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        ) : analysisData ? (
          <div className="space-y-6">
            <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6">
              <h4 className="text-lg font-medium text-zinc-300 mb-4">
                Topics & Timestamps
              </h4>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {analysisData.summary && analysisData.summary.length > 0 ? (
                  analysisData.summary.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-3 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleTimestampClick(item.timestamp)}
                          className="inline-block px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-mono rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-zinc-900"
                          title="Click to jump to this timestamp in the video"
                        >
                          {item.timestamp}
                        </button>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-zinc-300">{item.topic}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">
                    No topics found in the analysis.
                  </p>
                )}
              </div>
            </div>

            {/* Video Chat Interface */}
            {analysisData.formattedTranscript && (
              <VideoChat
                videoId={analysisData.videoId}
                formattedTranscript={analysisData.formattedTranscript}
              />
            )}

            {/* Video Search Interface */}
            <VideoSearch videoUrl={videoUrl} videoId={analysisData.videoId} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
