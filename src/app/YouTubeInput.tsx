"use client";

import { SectionBreakdownLoadingSkeleton } from "@/components/section-breakdown-skeleton";
import { VideoUrlForm } from "@/components/VideoUrlForm";
import { ErrorDisplay } from "@/components/ErrorDisplay";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { useYouTubePlayer } from "@/hooks/useYouTubePlayer";

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

  const { isPlayerReady, playerRef, seekToTimestamp } = useYouTubePlayer({
    videoId: analysisData?.videoId,
  });

  const handleFormSubmit = async () => {
    resetAnalysis();
    await handleSubmit();
  };

  return (
    <div className="space-y-8">
      {/* Video URL Form */}
      <VideoUrlForm
        videoUrl={videoUrl}
        onVideoUrlChange={setVideoUrl}
        onSubmit={handleFormSubmit}
        isLoading={isLoading}
      />

      {/* Results Section */}
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
    </div>
  );
}
