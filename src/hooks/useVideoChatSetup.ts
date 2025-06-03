import { useState } from "react";
import type { FormattedTranscriptItem } from "@/types/video-analysis";

interface UseVideoChatSetupReturn {
  selectedChatVideo: string | null;
  chatTranscript: FormattedTranscriptItem[] | null;
  isLoadingTranscript: boolean;
  transcriptError: string | null;
  handleStartChat: (videoId: string) => Promise<void>;
  handleBackToForm: () => void;
}

export function useVideoChatSetup(): UseVideoChatSetupReturn {
  const [selectedChatVideo, setSelectedChatVideo] = useState<string | null>(
    null
  );
  const [chatTranscript, setChatTranscript] = useState<
    FormattedTranscriptItem[] | null
  >(null);
  const [isLoadingTranscript, setIsLoadingTranscript] = useState(false);
  const [transcriptError, setTranscriptError] = useState<string | null>(null);

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

  return {
    selectedChatVideo,
    chatTranscript,
    isLoadingTranscript,
    transcriptError,
    handleStartChat,
    handleBackToForm,
  };
}
