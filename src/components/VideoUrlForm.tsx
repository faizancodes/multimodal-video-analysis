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
      title: "Video 1",
    },
    {
      id: "vnkVYLhGd_s",
      url: "https://www.youtube.com/watch?v=vnkVYLhGd_s",
      title: "Video 2",
    },
    {
      id: "eEg5ZjFxMmU",
      url: "https://www.youtube.com/watch?v=eEg5ZjFxMmU",
      title: "Video 3",
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
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              Or check out these sample videos
            </h3>
            <p className="text-sm text-slate-500">
              Chat with AI about these videos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {predefinedVideos.map(video => (
              <div
                key={video.id}
                className="bg-white/[0.02] border border-white/[0.05] rounded-lg p-4 space-y-4"
              >
                <div className="relative w-full rounded-lg overflow-hidden bg-black/20">
                  <div style={{ paddingBottom: "56.25%" }} className="relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${video.id}`}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="absolute top-0 left-0 w-full h-full"
                    />
                  </div>
                </div>

                <button
                  onClick={() => handleStartChat(video.id)}
                  className="w-full px-4 py-3 bg-gradient-to-r from-blue-800 to-purple-800 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent group"
                >
                  <div className="flex items-center justify-center space-x-2">
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
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <span>Start Chat</span>
                  </div>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
