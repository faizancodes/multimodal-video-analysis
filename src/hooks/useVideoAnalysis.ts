import { useState } from "react";

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

interface UseVideoAnalysisReturn {
  videoUrl: string;
  setVideoUrl: (url: string) => void;
  analysisData: AnalysisResponse | null;
  error: string;
  isLoading: boolean;
  handleSubmit: () => Promise<void>;
  resetAnalysis: () => void;
}

export function useVideoAnalysis(): UseVideoAnalysisReturn {
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

  const resetAnalysis = () => {
    setAnalysisData(null);
    setError("");
    setIsLoading(false);
  };

  return {
    videoUrl,
    setVideoUrl,
    analysisData,
    error,
    isLoading,
    handleSubmit,
    resetAnalysis,
  };
}
