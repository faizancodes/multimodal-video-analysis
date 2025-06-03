"use client";

import { useState } from "react";
import { SectionBreakdownLoadingSkeleton } from "@/components/section-breakdown-skeleton";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { AnalysisResults } from "@/components/AnalysisResults";
import { VideoChat } from "@/components/VideoChat";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

import type { FormattedTranscriptItem } from "@/types/video-analysis";

export function YouTubeInput() {
  // Chat-related state
  const [selectedChatVideo, setSelectedChatVideo] = useState<string | null>(
    null
  );
  const [chatTranscript, setChatTranscript] = useState<
    FormattedTranscriptItem[] | null
  >(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

  // Use custom hooks
  const {
    videoUrl,
    setVideoUrl,
    analysisData,
    error,
    isLoading,
    handleSubmit,
    resetAnalysis,
  } = useVideoAnalysis();

  const { isPlayerReady, playerRef, seekToTimestamp } = useYouTubePlayer({
    videoId: analysisData?.videoId || selectedChatVideo || undefined,
  });

  const handleFormSubmit = async () => {
    resetAnalysis();
    await handleSubmit();
  };

  const handleStartChat = async (videoId: string) => {
    setIsLoadingTranscript(true);
    setTranscriptError(null);

    try {
      // Fetch transcript via API endpoint
      const response = await fetch("/api/transcript", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ videoId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch transcript");
      }

      setChatTranscript(data.transcript);
      setSelectedChatVideo(videoId);
    } catch (error) {
      console.error("Error fetching transcript:", error);
      setTranscriptError(
        error instanceof Error
          ? error.message
          : "Failed to load transcript for this video"
      );
    } finally {
      setIsLoadingTranscript(false);
    }
  };

  const handleBackToForm = () => {
    setSelectedChatVideo(null);
    setChatTranscript(null);
    setTranscriptError(null);
  };

  const handleChatTimestampClick = (timestamp: string) => {
    // For chat videos, we can still use the timestamp functionality
    seekToTimestamp(timestamp);
  };

  return (
    <div className="space-y-8">
      {/* Video URL Form */}
      <VideoUrlForm
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
        selectedChatVideo={selectedChatVideo}
        onStartChat={handleStartChat}
        onBackToForm={handleBackToForm}
      />

      {/* Loading State for Transcript */}
      {isLoadingTranscript && (
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center space-x-3">
            <svg
              className="w-6 h-6 animate-spin text-blue-500"
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
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span className="text-slate-300">Loading transcript...</span>
          </div>
        </div>
      )}

      {/* Transcript Error */}
      {transcriptError && <ErrorDisplay error={transcriptError} />}

      {/* Chat Interface for Selected Video */}
      {selectedChatVideo && chatTranscript && !isLoadingTranscript && (
        <div className="space-y-6">
          {/* Video Player for Chat */}
          <div className="relative bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-sm">
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
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span className="text-sm">Loading video player...</span>
              </div>
            )}
          </div>

          {/* Chat Component */}
          <VideoChat
            videoId={selectedChatVideo}
            formattedTranscript={chatTranscript}
            onTimestampClick={handleChatTimestampClick}
          />
        </div>
      )}

      {/* Results Section for Regular Analysis */}
      {!selectedChatVideo && (
        <div className="mt-12">
          {isLoading ? (
            <SectionBreakdownLoadingSkeleton />
          ) : error ? (
            <ErrorDisplay error={error} />
          ) : analysisData ? (
            <AnalysisResults
              analysisData={analysisData}
              videoUrl={videoUrl}
              playerRef={playerRef}
              isPlayerReady={isPlayerReady}
              onTimestampClick={seekToTimestamp}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
