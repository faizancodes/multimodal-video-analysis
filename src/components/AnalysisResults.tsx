import { VideoChat } from "./VideoChat";
import { VideoSearch } from "./VideoSearch";
import { YouTubePlayerEmbed } from "./YouTubePlayerEmbed";
import { TopicsList } from "./TopicsList";
import { type FormattedTranscriptItem } from "../hooks/useVideoChat";

interface Topic {
  timestamp: string;
  topic: string;
}

interface AnalysisData {
  videoId: string;
  summary: Topic[];
  formattedTranscript?: FormattedTranscriptItem[];
}

interface AnalysisResultsProps {
  analysisData: AnalysisData;
  videoUrl: string;
  playerRef: React.RefObject<HTMLDivElement | null>;
  isPlayerReady: boolean;
  onTimestampClick: (timestamp: string) => void;
}

export function AnalysisResults({
  analysisData,
  videoUrl,
  playerRef,
  isPlayerReady,
  onTimestampClick,
}: AnalysisResultsProps) {
  return (
    <div className="space-y-8">
      {/* YouTube Video Embed */}
      <YouTubePlayerEmbed playerRef={playerRef} isPlayerReady={isPlayerReady} />

      {/* Topics & Timestamps */}
      <TopicsList
        topics={analysisData.summary}
        onTimestampClick={onTimestampClick}
        isPlayerReady={isPlayerReady}
      />

      {/* Video Chat Interface */}
      {analysisData.formattedTranscript && (
        <VideoChat
          videoId={analysisData.videoId}
          formattedTranscript={analysisData.formattedTranscript}
          onTimestampClick={onTimestampClick}
        />
      )}

      {/* Video Search Interface */}
      <VideoSearch
        videoUrl={videoUrl}
        videoId={analysisData.videoId}
        onTimestampClick={onTimestampClick}
      />
    </div>
  );
}
