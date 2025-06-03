// Types for video analysis functionality

export interface FallbackTranscriptItem {
  subtitle: string;
  start: number;
  dur: number;
}

export interface FallbackAPIResponse {
  title: string;
  description: string;
  availableLangs: string[];
  lengthInSeconds: string;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  transcription: FallbackTranscriptItem[];
}

export interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

export interface AnalysisTopic {
  topic: string;
  timestamp: string;
}

export interface FormattedTranscriptItem {
  text: string;
  startTime: number;
  endTime: number;
  duration: number;
  formattedStartTime: string;
  formattedEndTime: string;
  lang: string;
}

export interface VideoAnalysisResponse {
  summary: AnalysisTopic[];
  videoId: string;
  transcriptLength: number;
  formattedSentences: number;
  formattedTranscript: FormattedTranscriptItem[];
  transcriptSource: "youtube-direct" | "fallback-api";
}
