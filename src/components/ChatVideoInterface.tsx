import React from "react";
import { motion } from "framer-motion";
import { VideoChat } from "@/components/VideoChat";
import { ChatVideoPlayer } from "@/components/ChatVideoPlayer";
import type { FormattedTranscriptItem } from "@/types/video-analysis";

interface ChatVideoInterfaceProps {
  selectedChatVideo: string;
  chatTranscript: FormattedTranscriptItem[];
  isLoadingTranscript: boolean;
  playerRef: React.RefObject<HTMLDivElement | null>;
  isPlayerReady: boolean;
  onTimestampClick: (timestamp: string) => void;
}

export function ChatVideoInterface({
  selectedChatVideo,
  chatTranscript,
  isLoadingTranscript,
  playerRef,
  isPlayerReady,
  onTimestampClick,
}: ChatVideoInterfaceProps) {
  if (!selectedChatVideo || !chatTranscript || isLoadingTranscript) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1], // Custom easing for smooth animation
      }}
      className="space-y-6"
    >
      {/* Video Player for Chat */}
      <ChatVideoPlayer playerRef={playerRef} isPlayerReady={isPlayerReady} />

      {/* Chat Component */}
      <VideoChat
        videoId={selectedChatVideo}
        formattedTranscript={chatTranscript}
        onTimestampClick={onTimestampClick}
      />
    </motion.div>
  );
}
