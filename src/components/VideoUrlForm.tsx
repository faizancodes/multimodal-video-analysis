interface VideoUrlFormProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
  selectedChatVideo?: string | null;
  onStartChat?: (videoId: string) => void;
  onBackToForm?: () => void;
}

export function VideoUrlForm({
  videoUrl,
  onVideoUrlChange,
  onSubmit,
  isLoading,
  selectedChatVideo,
  onStartChat,
  onBackToForm,
}: VideoUrlFormProps) {
  const predefinedVideos = [
    {
      id: "LSuSb7NFUT8",
      url: "https://www.youtube.com/watch?v=LSuSb7NFUT8",
      title: "WindSurf CEO: From $0 to $3B Exit",
      description: "Building the future with AI coding agents",
      thumbnail: `https://img.youtube.com/vi/LSuSb7NFUT8/maxresdefault.jpg`,
    },
    {
      id: "vnkVYLhGd_s",
      url: "https://www.youtube.com/watch?v=vnkVYLhGd_s",
      title: "Mercor CEO on AI's Impact on Jobs",
      description: "How Mercor is building AI to predict job performance",
      thumbnail: `https://img.youtube.com/vi/vnkVYLhGd_s/maxresdefault.jpg`,
    },
    {
      id: "eEg5ZjFxMmU",
      url: "https://www.youtube.com/watch?v=eEg5ZjFxMmU",
      title: "Asking Politicians How They Got Wealthy",
      description: "Interviews with politicians in DC on their career paths",
      thumbnail: `https://img.youtube.com/vi/eEg5ZjFxMmU/maxresdefault.jpg`,
    },
  ];

  const handleSubmit = async () => {
    await onSubmit();
  };

  const handleStartChat = (videoId: string) => {
    if (onStartChat) {
      onStartChat(videoId);
    }
  };

  if (selectedChatVideo && onBackToForm) {
    return (
      <div className="space-y-4">
        <button
          onClick={onBackToForm}
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          <span>Back to Videos</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="relative">
          <label
            htmlFor="youtube-url"
            className="block text-sm font-medium text-slate-300 mb-3"
          >
            YouTube Video URL
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg
                className="w-5 h-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              id="youtube-url"
              type="url"
              value={videoUrl}
              onChange={e => onVideoUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full pl-12 pr-4 py-4 bg-white/[0.03] border border-white/[0.08] rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 hover:bg-white/[0.05] backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!videoUrl.trim() || isLoading}
          className="relative w-full px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent group overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
          <div className="relative flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <span>Analyzing Video...</span>
              </>
            ) : (
              <>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                <span>Analyze Video</span>
              </>
            )}
          </div>
        </button>
      </div>

      {!isLoading && !videoUrl.trim() && (
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Or chat with AI about these videos
            </h3>
            <p className="text-sm text-slate-400">
              Choose a video below to start an AI-powered conversation
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {predefinedVideos.map((video, index) => (
              <div
                key={video.id}
                className="group relative bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden hover:border-white/[0.15] transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Video thumbnail */}
                <div className="relative w-full aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />

                  {/* Shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-white text-lg leading-tight line-clamp-2">
                      {video.title}
                    </h4>
                    <p className="text-slate-400 text-sm leading-relaxed line-clamp-2">
                      {video.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleStartChat(video.id)}
                    className="relative w-full px-4 py-3 bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-transparent group/btn overflow-hidden backdrop-blur-sm"
                  >
                    {/* Button shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-500" />

                    <div className="relative flex items-center justify-center space-x-2">
                      <svg
                        className="w-4 h-4 transition-transform group-hover/btn:scale-110"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span className="text-sm font-medium">Start Chat</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
