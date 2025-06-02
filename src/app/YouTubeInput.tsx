"use client";

import { useState } from "react";

export function YouTubeInput() {
  const [videoUrl, setVideoUrl] = useState("");
  const [analysis, setAnalysis] = useState("");

  const handleSubmit = async () => {
    const response = await fetch("/api/video-analysis", {
      method: "POST",
      body: JSON.stringify({ videoUrl }),
    });
    const data = await response.json();
    setAnalysis(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="youtube-url"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            YouTube Video URL
          </label>
          <input
            id="youtube-url"
            type="url"
            value={videoUrl}
            onChange={e => setVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="w-full px-4 py-3 bg-white/[0.05] border border-white/[0.1] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!videoUrl.trim()}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
        >
          Analyze Video
        </button>
      </div>

      <div className="mt-8">
        <p className="text-sm text-zinc-400">{analysis}</p>
      </div>
    </div>
  );
}
