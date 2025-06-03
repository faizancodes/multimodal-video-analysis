"use client";

import { useState, useEffect, useRef } from "react";
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

// YouTube Player API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
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
  const [player, setPlayer] = useState<any>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Load YouTube iframe API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        return;
      }

      // Create script tag for YouTube iframe API
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);

      // Set up the callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        // API is loaded, player will be created when we have video data
      };
    };

    loadYouTubeAPI();
  }, []);

  // Create YouTube player when analysis data is available
  useEffect(() => {
    if (analysisData && window.YT && window.YT.Player && playerRef.current) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        height: "400",
        width: "100%",
        videoId: analysisData.videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true);
          },
          onError: (event: any) => {
            console.error("YouTube player error:", event.data);
          },
        },
      });

      setPlayer(newPlayer);

      // Cleanup function
      return () => {
        if (newPlayer && newPlayer.destroy) {
          newPlayer.destroy();
        }
      };
    }
  }, [analysisData]);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [player]);

  const handleSubmit = async () => {
    if (!videoUrl.trim()) return;

    setIsLoading(true);
    setError("");
    setAnalysisData(null);
    setPlayer(null);
    setIsPlayerReady(false);

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
    const seconds = timestampToSeconds(timestamp);

    if (player && isPlayerReady && player.seekTo) {
      // Seek to the timestamp in the embedded player
      player.seekTo(seconds, true);
      player.playVideo();
    } else {
      // Fallback to opening in new tab if player isn't ready
      if (analysisData?.videoId) {
        const youtubeUrl = getYouTubeUrlWithTimestamp(
          analysisData.videoId,
          timestamp
        );
        window.open(youtubeUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <label
              htmlFor="youtube-url"
              className="block text-sm font-medium text-slate-300 mb-3"
            >
              YouTube Video URL
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg
                  className="w-5 h-5 text-slate-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <input
                id="youtube-url"
                type="url"
                value={videoUrl}
                onChange={e => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-white/[0.05] backdrop-blur-sm"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!videoUrl.trim() || isLoading}
            className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
            <div className="relative flex items-center justify-center space-x-2">
              {isLoading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Analyzing Video...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>Analyze Video</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>

      <div className="mt-12">
        {isLoading ? (
          <SectionBreakdownLoadingSkeleton />
        ) : error ? (
          <div className="relative bg-gradient-to-r from-red-500/5 to-pink-500/5 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-5 h-5 text-red-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-red-300 font-medium">Analysis Error</p>
            </div>
            <p className="text-red-200 mt-2 ml-8">{error}</p>
          </div>
        ) : analysisData ? (
          <div className="space-y-8">
            {/* YouTube Video Embed */}
            <div className="relative bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Video Player</span>
                </h3>
              </div>
              <div
                className="relative w-full rounded-2xl overflow-hidden"
                style={{ paddingBottom: "56.25%" }}
              >
                <div
                  ref={playerRef}
                  className="absolute top-0 left-0 w-full h-full"
                />
              </div>
              {!isPlayerReady && (
                <div className="mt-6 flex items-center justify-center space-x-2 text-slate-400">
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-sm">Loading video player...</span>
                </div>
              )}
            </div>

            {/* Topics & Timestamps */}
            <div className="relative bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-sm">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Topics & Timestamps</span>
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  Click any timestamp to jump to that moment in the video
                </p>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {analysisData.summary && analysisData.summary.length > 0 ? (
                  analysisData.summary.map((item, index) => (
                    <div
                      key={index}
                      className="group flex items-start space-x-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl transition-all duration-200 border border-transparent hover:border-white/[0.05]"
                    >
                      <div className="flex-shrink-0">
                        <button
                          onClick={() => handleTimestampClick(item.timestamp)}
                          className="relative inline-flex px-3 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-300 hover:text-blue-200 text-sm font-mono rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 group-hover:scale-105"
                          title={
                            isPlayerReady
                              ? "Click to jump to this timestamp in the video above"
                              : "Click to jump to this timestamp in the video"
                          }
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                          <span className="relative">{item.timestamp}</span>
                        </button>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-200 leading-relaxed">
                          {item.topic}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <svg
                      className="w-12 h-12 text-slate-600 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-slate-500">
                      No topics found in the analysis.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Chat Interface */}
            {analysisData.formattedTranscript && (
              <VideoChat
                videoId={analysisData.videoId}
                formattedTranscript={analysisData.formattedTranscript}
                onTimestampClick={handleTimestampClick}
              />
            )}

            {/* Video Search Interface */}
            <VideoSearch
              videoUrl={videoUrl}
              videoId={analysisData.videoId}
              onTimestampClick={handleTimestampClick}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
