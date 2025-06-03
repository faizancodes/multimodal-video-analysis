"use client";

import { useVideoSearch } from "../hooks/useVideoSearch";
import { cn } from "@/lib/utils";

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
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-6 backdrop-blur-sm">
      <h4 className="text-lg font-medium text-zinc-300 mb-6 flex items-center space-x-2">
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span>Visual Video Search</span>
      </h4>

      {isCheckingEmbeddings && (
        <div className="mb-6 text-center py-8 animate-fade-in">
          <div className="inline-flex items-center justify-center space-x-3 text-zinc-400">
            <svg
              className="w-5 h-5 animate-spin"
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
            <span className="text-sm">Checking for existing embeddings...</span>
          </div>
        </div>
      )}

      {!isCheckingEmbeddings && !hasEmbeddings && (
        <div className="mb-6 animate-fade-in">
          <div className="text-center py-6 mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/[0.03] mb-4">
              <svg
                viewBox="0 0 24 24"
                className="w-8 h-8 text-zinc-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed">
              Generate visual embeddings to enable search functionality. This
              will analyze the video content to help you find specific moments.
            </p>
          </div>

          {generationProgress && (
            <div className="mb-6 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-300 flex items-center space-x-2">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>{generationProgress.step}</span>
                </span>
                <span className="text-zinc-400 font-medium">
                  {Math.round(generationProgress.progress)}%
                </span>
              </div>
              <div className="w-full bg-white/[0.05] rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500 ease-out"
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
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 shadow-sm hover:shadow-md disabled:shadow-none"
          >
            {isLoadingEmbeddings ? (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5"
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
                <span>Analyzing Video...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>Generate Visual Embeddings</span>
              </span>
            )}
          </button>
        </div>
      )}

      {!isCheckingEmbeddings && hasEmbeddings && (
        <form onSubmit={handleSearch} className="space-y-4 animate-fade-in">
          <div>
            <label
              htmlFor="search-query"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Search Video Content
            </label>
            <div className="relative">
              <input
                id="search-query"
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="e.g., 'person writing on whiteboard', 'code editor', 'diagram'"
                className="w-full pl-10 pr-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-sm"
                disabled={isSearching}
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          <button
            type="submit"
            disabled={!searchQuery.trim() || isSearching}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-zinc-900 shadow-sm hover:shadow-md disabled:shadow-none"
          >
            {isSearching ? (
              <span className="flex items-center justify-center space-x-2">
                <svg
                  className="animate-spin h-5 w-5"
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
                <span>Searching...</span>
              </span>
            ) : (
              "Search Video"
            )}
          </button>
        </form>
      )}

      {error && (
        <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-2xl p-4 animate-fade-in">
          <div className="flex items-center space-x-2 text-red-400">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {!isSearching &&
        hasEmbeddings &&
        searchResults.length === 0 &&
        searchQuery.trim() &&
        !error && (
          <div className="mt-6 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-6 text-center animate-fade-in">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-zinc-700/50 mb-4">
              <svg
                className="w-6 h-6 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <h6 className="text-lg font-medium text-zinc-300 mb-2">
              No Results Found
            </h6>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto leading-relaxed mb-4">
              No visual content matching &quot;
              <span className="font-medium text-zinc-300">{searchQuery}</span>
              &quot; was found in this video.
            </p>
            <div className="text-xs text-zinc-500 space-y-1">
              <p>Try searching for:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <span className="px-2 py-1 bg-zinc-700/30 rounded-md">
                  Visual elements
                </span>
                <span className="px-2 py-1 bg-zinc-700/30 rounded-md">
                  Objects or people
                </span>
                <span className="px-2 py-1 bg-zinc-700/30 rounded-md">
                  Activities or actions
                </span>
              </div>
            </div>
          </div>
        )}

      {searchResults.length > 0 && (
        <div className="mt-6 animate-fade-in">
          <h5 className="text-md font-medium text-zinc-300 mb-4 flex items-center space-x-2">
            <svg
              className="w-4 h-4 text-blue-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <span>Search Results ({searchResults.length})</span>
          </h5>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {searchResults.map((result, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start space-x-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-2xl hover:bg-white/[0.04] transition-all duration-200 animate-fade-in-up shadow-sm"
                )}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  opacity: 0,
                }}
              >
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleTimestampClick(result.timestamp)}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-mono rounded-lg transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    title="Click to jump to this timestamp in the video"
                  >
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                    </svg>
                    <span>{result.timestamp}</span>
                  </button>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-300 mb-2">{result.text}</p>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1 text-xs text-zinc-500">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>
                        Similarity: {(result.similarity * 100).toFixed(1)}%
                      </span>
                    </div>
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
