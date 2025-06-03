import React from "react";

interface ChatVideoPlayerProps {
  playerRef: React.RefObject<HTMLDivElement | null>;
  isPlayerReady: boolean;
}

export function ChatVideoPlayer({
  playerRef,
  isPlayerReady,
}: ChatVideoPlayerProps) {
  return (
    <div className="relative bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-sm">
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ paddingBottom: "56.25%" }}
      >
        <div ref={playerRef} className="absolute top-0 left-0 w-full h-full" />
      </div>
      {!isPlayerReady && (
        <div className="mt-6 flex items-center justify-center space-x-2 text-slate-400">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
          <span className="text-sm">Loading video player...</span>
        </div>
      )}
    </div>
  );
}
