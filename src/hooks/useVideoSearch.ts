import { useState, useEffect, useCallback } from "react";

export interface SearchResult {
  text: string;
  timestamp: string;
  similarity: number;
  videoId: string;
}

export interface GenerationProgress {
  step: string;
  progress: number;
  timeElapsed: number;
  estimatedTimeRemaining?: number;
}

interface UseVideoSearchParams {
  videoUrl: string;
  videoId: string;
}

// Utility function to convert timestamp (MM:SS or HH:MM:SS) to seconds
const timestampToSeconds = (timestamp: string): number => {
  const parts = timestamp.split(":").map(Number);

  if (parts.length === 2) {
    // MM:SS format
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }

  return 0; // fallback
};

// Generate YouTube URL with timestamp
const getYouTubeUrlWithTimestamp = (
  videoId: string,
  timestamp: string
): string => {
  const seconds = timestampToSeconds(timestamp);
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
};

export function useVideoSearch({ videoUrl, videoId }: UseVideoSearchParams) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoadingEmbeddings, setIsLoadingEmbeddings] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingEmbeddings, setIsCheckingEmbeddings] = useState(true);
  const [generationProgress, setGenerationProgress] =
    useState<GenerationProgress | null>(null);

  // Check if embeddings already exist when component mounts
  useEffect(() => {
    const checkExistingEmbeddings = async () => {
      try {
        const response = await fetch("/api/video-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: "test", // Dummy query just to check if embeddings exist
            videoUrl,
            maxResults: 1,
          }),
        });

        if (response.ok) {
          setHasEmbeddings(true);
        }
      } catch {
        // If embeddings don't exist, we'll show the generate button
        console.log("No existing embeddings found");
      } finally {
        setIsCheckingEmbeddings(false);
      }
    };

    checkExistingEmbeddings();
  }, [videoUrl]);

  const generateEmbeddings = useCallback(async () => {
    setIsLoadingEmbeddings(true);
    setError("");
    setGenerationProgress({
      step: "Initializing video analysis...",
      progress: 0,
      timeElapsed: 0,
    });

    const startTime = Date.now();

    // Progress simulation based on typical processing times
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      setGenerationProgress(prev => {
        if (!prev) return null;

        let newProgress = prev.progress;
        let newStep = prev.step;

        // Progress stages based on optimization improvements
        if (elapsed < 5000) {
          newProgress = Math.min(15, (elapsed / 5000) * 15);
          newStep =
            "Extracting visual descriptions with optimized processing...";
        } else if (elapsed < 15000) {
          newProgress = Math.min(60, 15 + ((elapsed - 5000) / 10000) * 45);
          newStep =
            "Analyzing video frames (using 0.5 FPS sampling for speed)...";
        } else if (elapsed < 20000) {
          newProgress = Math.min(85, 60 + ((elapsed - 15000) / 5000) * 25);
          newStep = "Generating embeddings with batch processing...";
        } else {
          newProgress = Math.min(95, 85 + ((elapsed - 20000) / 5000) * 10);
          newStep = "Finalizing and caching results...";
        }

        return {
          step: newStep,
          progress: newProgress,
          timeElapsed: elapsed,
          estimatedTimeRemaining:
            elapsed > 5000 ? Math.max(0, 25000 - elapsed) : undefined,
        };
      });
    }, 500);

    try {
      const response = await fetch("/api/video-embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoUrl,
          intervalSeconds: 30, // Extract descriptions every 30 seconds
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate embeddings");
      }

      clearInterval(progressInterval);
      setGenerationProgress({
        step: "Embeddings generated successfully!",
        progress: 100,
        timeElapsed: Date.now() - startTime,
      });

      setTimeout(() => {
        setHasEmbeddings(true);
        setGenerationProgress(null);
        console.log("Embeddings generated:", data);
      }, 1000);
    } catch (error) {
      clearInterval(progressInterval);
      setGenerationProgress(null);
      console.error("Error generating embeddings:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate video embeddings. Please try again."
      );
    } finally {
      setIsLoadingEmbeddings(false);
    }
  }, [videoUrl]);

  const handleSearch = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!searchQuery.trim()) return;

      setIsSearching(true);
      setError("");

      try {
        const response = await fetch("/api/video-search", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: searchQuery,
            videoUrl,
            minSimilarity: 0.3, // Lower threshold for broader results
            maxResults: 10,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Search failed");
        }

        setSearchResults(data.results);
      } catch (error) {
        console.error("Search error:", error);
        setError(
          error instanceof Error
            ? error.message
            : "Search failed. Please try again."
        );
      } finally {
        setIsSearching(false);
      }
    },
    [searchQuery, videoUrl]
  );

  const handleTimestampClick = useCallback(
    (timestamp: string) => {
      const youtubeUrl = getYouTubeUrlWithTimestamp(videoId, timestamp);
      window.open(youtubeUrl, "_blank", "noopener,noreferrer");
    },
    [videoId]
  );

  return {
    // State
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoadingEmbeddings,
    isSearching,
    hasEmbeddings,
    error,
    isCheckingEmbeddings,
    generationProgress,

    // Functions
    generateEmbeddings,
    handleSearch,
    handleTimestampClick,
  };
}
