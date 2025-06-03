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

interface ParsedElement {
  type: "text" | "timestamp" | "bold";
  content: string;
  originalText?: string;
  index: number;
}

// Component to render message content with clickable timestamps and bold formatting
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

  // Parse content to identify all formatting elements
  const parseContent = (text: string): ParsedElement[] => {
    const elements: ParsedElement[] = [];

    // Regex patterns for different formatting types
    const timestampRegex =
      /\[(\d{1,2}:\d{2}(?::\d{2})?(?:-\d{1,2}:\d{2}(?::\d{2})?)?)\]/g;
    const boldRegex = /\*\*(.*?)\*\*/g;

    // Find all matches with their positions
    const allMatches: Array<{
      type: "timestamp" | "bold";
      match: RegExpExecArray;
      content: string;
    }> = [];

    // Find timestamp matches
    let match;
    while ((match = timestampRegex.exec(text)) !== null) {
      allMatches.push({
        type: "timestamp",
        match,
        content: match[1],
      });
    }

    // Find bold text matches
    while ((match = boldRegex.exec(text)) !== null) {
      allMatches.push({
        type: "bold",
        match,
        content: match[1],
      });
    }

    // Sort matches by position
    allMatches.sort((a, b) => a.match.index - b.match.index);

    // Parse text with all formatting
    let lastIndex = 0;

    allMatches.forEach(matchInfo => {
      const { type, match, content } = matchInfo;

      // Add text before this match
      if (match.index > lastIndex) {
        const textContent = text.slice(lastIndex, match.index);
        if (textContent) {
          elements.push({
            type: "text",
            content: textContent,
            index: lastIndex,
          });
        }
      }

      // Add the formatted element
      elements.push({
        type,
        content,
        originalText: match[0],
        index: match.index,
      });

      lastIndex = match.index + match[0].length;
    });

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText) {
        elements.push({
          type: "text",
          content: remainingText,
          index: lastIndex,
        });
      }
    }

    return elements;
  };

  // Render parsed elements
  const renderElement = (element: ParsedElement, index: number) => {
    const key = `${element.type}-${element.index}-${index}`;

    switch (element.type) {
      case "timestamp":
        const timestamp = element.content;
        const isRange = timestamp.includes("-");

        return (
          <button
            key={key}
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

      case "bold":
        return (
          <strong key={key} className="font-semibold text-white">
            {element.content}
          </strong>
        );

      case "text":
      default:
        return element.content;
    }
  };

  const parsedElements = parseContent(content);

  return (
    <span className="whitespace-pre-wrap">
      {parsedElements.map((element, index) => renderElement(element, index))}
    </span>
  );
}
