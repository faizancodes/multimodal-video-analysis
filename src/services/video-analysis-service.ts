import { getGeminiResponse } from "@/utils/geminiClient";
import type {
  AnalysisTopic,
  FormattedTranscriptItem,
} from "@/types/video-analysis";

/**
 * Service for AI-powered video content analysis
 */
export class VideoAnalysisService {
  /**
   * Generate topic breakdown from formatted transcript
   */
  static async generateTopicBreakdown(
    formattedTranscript: FormattedTranscriptItem[]
  ): Promise<AnalysisTopic[]> {
    const prompt = `Based on the following formatted video transcript data, provide a breakdown of the main topics discussed in the video, with timestamps for each topic. The topics should be in the order they are discussed in the video, and should be broad enough to cover the main topics discussed in the video, not super specific ones.

        <Formatted Transcript>
          ${JSON.stringify(formattedTranscript, null, 2)}
        </Formatted Transcript>
        
        The transcript is an array of sentences with the following structure:
        {
          "text": "string (complete sentence)",
          "startTime": "number (seconds)",
          "endTime": "number (seconds)", 
          "duration": "number (seconds)",
          "formattedStartTime": "HH:MM:SS",
          "formattedEndTime": "HH:MM:SS",
          "lang": "string"
        }
        
         Generate a sequential list of topics discussed in the video, with timestamps for each high-level topic.
         Your response should be in the following JSON format:
        
          {
            "topics": [
              {
                "topic": "string",
                "timestamp": "HH:MM:SS"
              }
            ]
          }
        
         The topics should be in the order they are discussed in the video, and should be broad enough to cover the main topics discussed in the video, not super specific ones.
         The timestamps should be in the format of HH:MM:SS.
        
        `;

    try {
      console.log(
        "Generating AI analysis for transcript with",
        formattedTranscript.length,
        "sentences"
      );

      const response = await getGeminiResponse([
        { role: "user", content: prompt },
      ]);

      if (!response?.topics || !Array.isArray(response.topics)) {
        throw new Error("Invalid response format from AI analysis");
      }

      console.log(
        "AI analysis generated successfully with",
        response.topics.length,
        "topics"
      );
      return response.topics;
    } catch (error) {
      console.error("Error generating topic breakdown:", error);
      throw new Error("Failed to generate AI analysis of video content");
    }
  }
}
