import { YouTubeInput } from "./YouTubeInput";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-black">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Multimodal Video Analysis
            </h1>
            <p className="mt-4 text-lg text-zinc-400">
              Analyze YouTube videos with AI. Simply paste a YouTube link below
              to extract insights, transcripts, and visual analysis from any
              video content.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-16">
          <div className="overflow-hidden rounded-2xl bg-white/[0.05] shadow-xl ring-1 ring-white/[0.1]">
            <div className="p-8">
              <YouTubeInput />
            </div>
          </div>

          {/* Features */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-white/[0.1] px-5 py-4 bg-white/[0.02]">
              <h3 className="text-lg font-semibold text-white mb-2">
                🎥 Video Analysis
              </h3>
              <p className="text-sm text-zinc-400">
                Extract key frames and analyze visual content from YouTube
                videos.
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.1] px-5 py-4 bg-white/[0.02]">
              <h3 className="text-lg font-semibold text-white mb-2">
                📝 Transcription
              </h3>
              <p className="text-sm text-zinc-400">
                Generate accurate transcripts and identify key topics discussed.
              </p>
            </div>

            <div className="rounded-lg border border-white/[0.1] px-5 py-4 bg-white/[0.02] sm:col-span-2 lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-2">
                🤖 AI Insights
              </h3>
              <p className="text-sm text-zinc-400">
                Get intelligent summaries and insights powered by multimodal AI.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
