"use client";

import { useVideoSearch } from "../hooks/useVideoSearch";

interface VideoSearchProps {
  videoUrl: string;
  videoId: string;
  onTimestampClick?: (timestamp: string) => void;
}

export function VideoSearch({
  videoUrl,
  videoId,
  onTimestampClick,
}: VideoSearchProps) {
  const {
    searchQuery,
    setSearchQuery,
    searchResults,
    isLoadingEmbeddings,
    isSearching,
    hasEmbeddings,
    error,
    isCheckingEmbeddings,
    generationProgress,
    generateEmbeddings,
    handleSearch,
    handleTimestampClick: defaultHandleTimestampClick,
  } = useVideoSearch({ videoUrl, videoId });

  // Use passed onTimestampClick prop if available, otherwise use default from hook
  const handleTimestampClick = onTimestampClick || defaultHandleTimestampClick;

  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6">
      <h4 className="text-lg font-medium text-zinc-300 mb-4">
        Visual Video Search
        {generationProgress && (
          <span className="ml-2 text-sm font-normal text-blue-400">
            (Optimized Processing)
          </span>
        )}
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
            Generate visual embeddings to enable search functionality.
          </p>

          {generationProgress && (
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300">{generationProgress.step}</span>
                <span className="text-zinc-400">
                  {Math.round(generationProgress.progress)}%
                </span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${generationProgress.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-zinc-500">
                <span>
                  Elapsed: {Math.round(generationProgress.timeElapsed / 1000)}s
                </span>
                {generationProgress.estimatedTimeRemaining && (
                  <span>
                    Est. remaining:{" "}
                    {Math.round(
                      generationProgress.estimatedTimeRemaining / 1000
                    )}
                    s
                  </span>
                )}
              </div>
            </div>
          )}

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
    </div>
  );
}
