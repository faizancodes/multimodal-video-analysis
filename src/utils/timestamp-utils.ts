// Utility function to convert timestamp (MM:SS or HH:MM:SS) to seconds
export function timestampToSeconds(timestamp: string): number {
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
export function getYouTubeUrlWithTimestamp(
  videoId: string,
  timestamp: string
): string {
  const seconds = timestampToSeconds(timestamp);
  return `https://www.youtube.com/watch?v=${videoId}&t=${seconds}s`;
}

// Format timestamp for display by removing unnecessary "00:" hour component
export function formatTimestampForDisplay(timestamp: string): string {
  // Handle time ranges
  if (timestamp.includes("-")) {
    const [start, end] = timestamp.split("-");
    const formattedStart = start.startsWith("00:") ? start.slice(3) : start;
    const formattedEnd = end.startsWith("00:") ? end.slice(3) : end;
    return `${formattedStart}-${formattedEnd}`;
  }

  // Handle single timestamps
  return timestamp.startsWith("00:") ? timestamp.slice(3) : timestamp;
}
