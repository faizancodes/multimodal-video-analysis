import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatVideoPlayerProps {
  playerRef: React.RefObject<HTMLDivElement | null>;
  isPlayerReady: boolean;
}

export function ChatVideoPlayer({
  playerRef,
  isPlayerReady,
}: ChatVideoPlayerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1], // Custom easing for smooth animation
      }}
      className="relative bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-sm"
    >
      <div
        className="relative w-full rounded-2xl overflow-hidden"
        style={{ paddingBottom: "56.25%" }}
      >
        <div ref={playerRef} className="absolute top-0 left-0 w-full h-full" />
      </div>
      <AnimatePresence>
        {!isPlayerReady && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mt-6 flex items-center justify-center space-x-2 text-slate-400"
          ></motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
