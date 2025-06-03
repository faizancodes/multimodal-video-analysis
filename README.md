# Multimodal Video Analysis Tutorial

A comprehensive Next.js application for analyzing YouTube videos using Gemini AI and providing advanced features including transcript analysis, video chat, and natural language visual search.

## Features

- **YouTube Video Analysis**: Extract and analyze video transcripts with topic timestamps
- **Video Chat**: Ask questions about video content based on transcripts
- **Visual Video Search**: Generate embeddings from video snapshots for natural language search
- **AI-Powered**: Powered by Google's Gemini AI for video understanding
- **Caching**: Redis-based caching for optimal performance
- **Modern UI**: Built with Shadcn UI components and Tailwind CSS
- **Real-time Processing**: Fast API responses optimized for production

## Tech Stack

- [Next.js](https://nextjs.org) - React framework with App Router
- [Google Gemini AI](https://ai.google.dev/) - Multimodal AI for video understanding
- [OpenAI Embeddings](https://platform.openai.com/) - Text embeddings for semantic search
- [Upstash Redis](https://upstash.com/) - Serverless Redis for caching
- [Shadcn UI](https://ui.shadcn.com/) - Component library
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [TypeScript](https://www.typescriptlang.org/) - Type safety

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up your environment variables in the `.env.local` file:

```bash
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
```

4. Start the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

- `src/app/page.tsx` - Main application with YouTube video input
- `src/app/api/video-analysis/` - Video transcript analysis API
- `src/app/api/video-chat/` - Video content Q&A API
- `src/app/api/video-embeddings/` - Visual embeddings generation API
- `src/app/api/video-search/` - Natural language video search API
- `src/components/VideoChat.tsx` - Chat interface for video questions
- `src/components/VideoSearch.tsx` - Visual search interface
- `src/utils/geminiClient.ts` - Gemini AI client configuration
- `src/utils/embeddingClient.ts` - OpenAI embeddings client
- `src/utils/redisClient.ts` - Redis caching utilities

## API Endpoints

### POST `/api/video-analysis`

Analyzes YouTube video transcript and extracts topic timestamps.

**Request:**

```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
}
```

### POST `/api/video-embeddings`

Generates visual embeddings from video frames for search functionality.

**Request:**

```json
{
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "intervalSeconds": 30
}
```

### POST `/api/video-search`

Searches video content using natural language queries.

**Request:**

```json
{
  "query": "person writing on whiteboard",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "minSimilarity": 0.6,
  "maxResults": 10
}
```

### POST `/api/video-chat`

Interactive chat about video content based on transcript.

**Request:**

```json
{
  "question": "What is the main topic discussed?",
  "videoId": "VIDEO_ID",
  "formattedTranscript": [...],
  "chatHistory": [...]
}
```

## Usage

1. **Enter YouTube URL**: Paste any public YouTube video URL
2. **Analyze Video**: Extract transcript and generate topic breakdown with timestamps
3. **Chat with Video**: Ask questions about the video content using the transcript
4. **Visual Search**: Generate visual embeddings and search for specific visual content
   - Click "Generate Visual Embeddings" to analyze video frames
   - Use natural language to search (e.g., "code editor", "diagram", "person presenting")
   - Click timestamps to jump to relevant moments in the video

## Performance Optimizations

- **Caching**: All transcripts and embeddings are cached in Redis for 30 days
- **Batch Processing**: Embeddings are generated in batches for efficiency
- **Fallback Models**: Multiple Gemini models with automatic fallback
- **Serverless Ready**: Optimized for Vercel and other serverless platforms

## Learn More

To learn more about the technologies used in this project:

- [Next.js Documentation](https://nextjs.org/docs) - Next.js features and API
- [Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions) - Learn about Next.js Server Actions
- [Shadcn UI Documentation](https://ui.shadcn.com) - Learn about Shadcn UI components
- [Tailwind CSS Documentation](https://tailwindcss.com/docs) - Learn about Tailwind CSS

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
