import { YouTubeInput } from "./YouTubeInput";

export default async function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 relative overflow-hidden">
      {/* Background decorative elements */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Gradient orbs for visual interest */}
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
      <div
        className="absolute -bottom-8 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col items-center justify-center space-y-12 text-center">
          <div className="max-w-4xl space-y-6">
            {/* Main title with enhanced typography */}
            <div className="space-y-12">
              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  Multimodal Video Analysis
                </span>
                <br />
              </h1>
            </div>

            <p className="text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto">
              Transform your YouTube videos into actionable insights. Our AI
              extracts <span className="font-medium">transcripts, </span>
              <span className="font-medium">visual analysis</span>, and{" "}
              <span className="font-medium">intelligent summaries</span> from
              any video content.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-12">
          <div className="relative">
            {/* Enhanced glassmorphism container */}
            <div className="overflow-hidden rounded-3xl bg-white/[0.03] shadow-2xl ring-1 ring-white/[0.05] backdrop-blur-2xl">
              {/* Top gradient border */}
              <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>

              <div className="p-8 sm:p-8">
                <YouTubeInput />
              </div>

              {/* Bottom gradient border */}
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
            </div>

            {/* Subtle shadow underneath */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-3xl opacity-30 -z-10 scale-105"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
