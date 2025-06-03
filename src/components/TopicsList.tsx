interface Topic {
  timestamp: string;
  topic: string;
}

interface TopicsListProps {
  topics: Topic[];
  onTimestampClick: (timestamp: string) => void;
  isPlayerReady: boolean;
}

export function TopicsList({
  topics,
  onTimestampClick,
  isPlayerReady,
}: TopicsListProps) {
  return (
    <div className="relative bg-gradient-to-br from-white/[0.02] to-white/[0.01] border border-white/[0.08] rounded-3xl p-8 backdrop-blur-sm">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>Topics & Timestamps</span>
        </h3>
        <p className="text-slate-400 text-sm mt-1">
          Click any timestamp to jump to that moment in the video
        </p>
      </div>

      <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
        {topics && topics.length > 0 ? (
          topics.map((item, index) => (
            <div
              key={index}
              className="group flex items-start space-x-4 p-4 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl transition-all duration-200 border border-transparent hover:border-white/[0.05]"
            >
              <div className="flex-shrink-0">
                <button
                  onClick={() => onTimestampClick(item.timestamp)}
                  className="relative inline-flex px-3 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-500/30 hover:to-purple-500/30 text-blue-300 hover:text-blue-200 text-sm font-mono rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 group-hover:scale-105"
                  title={
                    isPlayerReady
                      ? "Click to jump to this timestamp in the video above"
                      : "Click to jump to this timestamp in the video"
                  }
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                  <span className="relative">{item.timestamp}</span>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 leading-relaxed">{item.topic}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-slate-600 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-slate-500">No topics found in the analysis.</p>
          </div>
        )}
      </div>
    </div>
  );
}
