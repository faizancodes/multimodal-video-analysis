"use client";

import { useState, useEffect } from "react";

interface SearchResult {
  text: string;
  timestamp: string;
  similarity: number;
  videoId: string;
}

interface VideoSearchProps {
  videoUrl: string;
  videoId: string;
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

export function VideoSearch({ videoUrl, videoId }: VideoSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoadingEmbeddings, setIsLoadingEmbeddings] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [error, setError] = useState("");
  const [isCheckingEmbeddings, setIsCheckingEmbeddings] = useState(true);

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

  const generateEmbeddings = async () => {
    setIsLoadingEmbeddings(true);
    setError("");

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

      setHasEmbeddings(true);
      console.log("Embeddings generated:", data);
    } catch (error) {
      console.error("Error generating embeddings:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to generate video embeddings. Please try again."
      );
    } finally {
      setIsLoadingEmbeddings(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
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
  };

  const handleTimestampClick = (timestamp: string) => {
    const youtubeUrl = getYouTubeUrlWithTimestamp(videoId, timestamp);
    window.open(youtubeUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6">
      <h4 className="text-lg font-medium text-zinc-300 mb-4">
        Visual Video Search
      </h4>

      {isCheckingEmbeddings && (
        <div className="mb-6 text-center py-4">
          <div className="inline-flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-zinc-500 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm text-zinc-400">
              Checking for existing embeddings...
            </span>
          </div>
        </div>
      )}

      {!isCheckingEmbeddings && !hasEmbeddings && (
        <div className="mb-6">
          <p className="text-sm text-zinc-400 mb-4">
            First, generate visual embeddings to enable search functionality.
            This will analyze the video&apos;s visual content at regular
            intervals.
          </p>
          <button
            onClick={generateEmbeddings}
            disabled={isLoadingEmbeddings}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            {isLoadingEmbeddings
              ? "Analyzing Video..."
              : "Generate Visual Embeddings"}
          </button>
        </div>
      )}

      {!isCheckingEmbeddings && hasEmbeddings && (
        <form onSubmit={handleSearch} className="space-y-4">
          <div>
            <label
              htmlFor="search-query"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Search Video Content
            </label>
            <input
              id="search-query"
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g., 'person writing on whiteboard', 'code editor', 'diagram'"
              className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              disabled={isSearching}
            />
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
          >
            {isSearching ? "Searching..." : "Search Video"}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-6">
          <h5 className="text-md font-medium text-zinc-300 mb-3">
            Search Results ({searchResults.length})
          </h5>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className="flex items-start space-x-4 p-4 bg-white/[0.02] rounded-lg hover:bg-white/[0.04] transition-colors"
              >
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleTimestampClick(result.timestamp)}
                    className="inline-block px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-mono rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-zinc-900"
                    title="Click to jump to this timestamp in the video"
                  >
                    {result.timestamp}
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-300 mb-1">{result.text}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-zinc-500">
                      Similarity: {(result.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasEmbeddings &&
        searchResults.length === 0 &&
        searchQuery &&
        !isSearching && (
          <div className="mt-4 text-center py-8">
            <p className="text-zinc-500 text-sm">
              No results found for &quot;{searchQuery}&quot;. Try different
              keywords or lower the similarity threshold.
            </p>
          </div>
        )}
    </div>
  );
}
