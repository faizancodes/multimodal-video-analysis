interface VideoUrlFormProps {
  videoUrl: string;
  onVideoUrlChange: (url: string) => void;
  onSubmit: () => Promise<void>;
  isLoading: boolean;
}

export function VideoUrlForm({
  videoUrl,
  onVideoUrlChange,
  onSubmit,
  isLoading,
}: VideoUrlFormProps) {
  const handleSubmit = async () => {
    await onSubmit();
  };

  return (
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
  );
}
