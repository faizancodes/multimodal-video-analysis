import { useState, useEffect, useRef } from "react";

// YouTube Player API types
interface YouTubePlayer {
  destroy: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
}

declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement,
        config: YouTubePlayerConfig
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerConfig {
  height: string;
  width: string;
  videoId: string;
  playerVars: {
    autoplay: number;
    controls: number;
    rel: number;
    showinfo: number;
    modestbranding: number;
  };
  events: {
    onReady: () => void;
    onError: (event: { data: number }) => void;
  };
}

interface UseYouTubePlayerProps {
  videoId?: string;
}

interface UseYouTubePlayerReturn {
  player: YouTubePlayer | null;
  isPlayerReady: boolean;
  playerRef: React.RefObject<HTMLDivElement | null>;
  seekToTimestamp: (timestamp: string) => void;
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

export function useYouTubePlayer({
  videoId,
}: UseYouTubePlayerProps): UseYouTubePlayerReturn {
  const [player, setPlayer] = useState<YouTubePlayer | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const playerRef = useRef<HTMLDivElement>(null);

  // Load YouTube iframe API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      // Check if API is already loaded
      if (window.YT && window.YT.Player) {
        return;
      }

      // Create script tag for YouTube iframe API
      const script = document.createElement("script");
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);

      // Set up the callback for when API is ready
      window.onYouTubeIframeAPIReady = () => {
        // API is loaded, player will be created when we have video data
      };
    };

    loadYouTubeAPI();
  }, []);

  // Create YouTube player when videoId is available
  useEffect(() => {
    if (videoId && window.YT && window.YT.Player && playerRef.current) {
      const newPlayer = new window.YT.Player(playerRef.current, {
        height: "400",
        width: "100%",
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            setIsPlayerReady(true);
          },
          onError: (event: { data: number }) => {
            console.error("YouTube player error:", event.data);
          },
        },
      });

      setPlayer(newPlayer);

      // Cleanup function
      return () => {
        if (newPlayer && newPlayer.destroy) {
          newPlayer.destroy();
        }
      };
    }
  }, [videoId]);

  // Cleanup player on unmount
  useEffect(() => {
    return () => {
      if (player && player.destroy) {
        player.destroy();
      }
    };
  }, [player]);

  // Handle timestamp seeking
  const seekToTimestamp = (timestamp: string) => {
    const seconds = timestampToSeconds(timestamp);

    if (player && isPlayerReady && player.seekTo) {
      // Seek to the timestamp in the embedded player
      player.seekTo(seconds, true);
      player.playVideo();
    } else {
      // Fallback to opening in new tab if player isn't ready
      if (videoId) {
        const youtubeUrl = getYouTubeUrlWithTimestamp(videoId, timestamp);
        window.open(youtubeUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  // Reset player state when videoId changes
  useEffect(() => {
    if (!videoId) {
      setPlayer(null);
      setIsPlayerReady(false);
    }
  }, [videoId]);

  return {
    player,
    isPlayerReady,
    playerRef,
    seekToTimestamp,
  };
}
