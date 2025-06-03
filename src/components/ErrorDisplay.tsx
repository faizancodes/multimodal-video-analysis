interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  return (
    <div className="relative bg-gradient-to-r from-red-500/5 to-pink-500/5 border border-red-500/20 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          <svg
            className="w-5 h-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-red-300 font-medium">Analysis Error</p>
      </div>
      <p className="text-red-200 mt-2 ml-8">{error}</p>
    </div>
  );
}
