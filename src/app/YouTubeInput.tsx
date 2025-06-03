"use client";

import React from "react";
import { SectionBreakdownLoadingSkeleton } from "@/components/SectionBreakdownSkeleton";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { AnalysisResults } from "@/components/AnalysisResults";
import { TranscriptLoadingIndicator } from "@/components/TranscriptLoadingIndicator";
import { ChatVideoInterface } from "@/components/ChatVideoInterface";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";
import { useVideoChatSetup } from "@/hooks/useVideoChatSetup";

export function YouTubeInput() {
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

  const {
    selectedChatVideo,
    chatTranscript,
    isLoadingTranscript,
    transcriptError,
    handleStartChat,
    handleBackToForm,
  } = useVideoChatSetup();

  const { isPlayerReady, playerRef, seekToTimestamp } = useYouTubePlayer({
    videoId: analysisData?.videoId || selectedChatVideo || undefined,
  });

  const handleFormSubmit = async () => {
    resetAnalysis();
    await handleSubmit();
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
      <TranscriptLoadingIndicator isLoading={isLoadingTranscript} />

      {/* Transcript Error */}
      {transcriptError && <ErrorDisplay error={transcriptError} />}

      {/* Chat Interface for Selected Video */}
      <ChatVideoInterface
        selectedChatVideo={selectedChatVideo || ""}
        chatTranscript={chatTranscript || []}
        isLoadingTranscript={isLoadingTranscript}
        playerRef={playerRef}
        isPlayerReady={isPlayerReady}
        onTimestampClick={handleChatTimestampClick}
      />

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
