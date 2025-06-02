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
        </div>
      </div>
    </div>
  );
}
