"use client";

import {
  getYouTubeUrlWithTimestamp,
  formatTimestampForDisplay,
} from "../utils/timestamp-utils";

interface MessageContentProps {
  content: string;
  videoId: string;
  onTimestampClick?: (timestamp: string) => void;
}

// Component to render message content with clickable timestamps
export function MessageContent({
  content,
  videoId,
  onTimestampClick,
}: MessageContentProps) {
  const handleTimestampClick = (timestamp: string) => {
    // Extract start time if it's a range (e.g., "00:02:40-00:02:49" -> "00:02:40")
    const startTime = timestamp.includes("-")
      ? timestamp.split("-")[0]
      : timestamp;

    if (onTimestampClick) {
      onTimestampClick(startTime);
    } else {
      // Fallback to opening in new tab
      const youtubeUrl = getYouTubeUrlWithTimestamp(videoId, startTime);
      window.open(youtubeUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Regex to match timestamps in format [HH:MM:SS], [MM:SS], or time ranges [HH:MM:SS-HH:MM:SS], [MM:SS-MM:SS]
  const timestampRegex =
    /\[(\d{1,2}:\d{2}(?::\d{2})?(?:-\d{1,2}:\d{2}(?::\d{2})?)?)\]/g;

  // Split content by timestamps and create clickable elements
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = timestampRegex.exec(content)) !== null) {
    // Add text before timestamp
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }

    // Add clickable timestamp or time range
    const timestamp = match[1];
    const isRange = timestamp.includes("-");

    parts.push(
      <button
        key={`${match.index}-${timestamp}`}
        onClick={() => handleTimestampClick(timestamp)}
        className="inline-block px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 hover:text-blue-300 text-xs font-mono rounded transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-zinc-900 mx-1"
        title={
          isRange
            ? `Click to jump to ${formatTimestampForDisplay(timestamp.split("-")[0])} (start of time range)`
            : `Click to jump to ${formatTimestampForDisplay(timestamp)} in the video`
        }
      >
        {formatTimestampForDisplay(timestamp)}
      </button>
    );

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return <span className="whitespace-pre-wrap">{parts}</span>;
}
