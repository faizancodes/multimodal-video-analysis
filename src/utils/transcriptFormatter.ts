interface TranscriptItem {
  text: string;
  duration: number;
  offset: number;
  lang?: string;
}

interface FormattedSentence {
  text: string;
  startTime: number;
  endTime: number;
  duration: number;
  lang: string;
}

/**
 * Formats YouTube transcript data by combining fragments into complete sentences
 * while maintaining accurate timestamps
 */
export function formatTranscriptIntoSentences(
  transcript: TranscriptItem[]
): FormattedSentence[] {
  if (!transcript || transcript.length === 0) {
    return [];
  }

  // Validate and sanitize transcript data
  const validatedTranscript = transcript.filter((item, index) => {
    if (!item || typeof item !== "object") {
      console.error(`Invalid transcript item at index ${index}:`, item);
      return false;
    }

    if (typeof item.text !== "string") {
      console.error(`Invalid text property at index ${index}:`, {
        text: item.text,
        type: typeof item.text,
        item,
      });
      return false;
    }

    if (typeof item.offset !== "number" || typeof item.duration !== "number") {
      console.error(`Invalid timing properties at index ${index}:`, {
        offset: item.offset,
        duration: item.duration,
        item,
      });
      return false;
    }

    return true;
  });

  if (validatedTranscript.length === 0) {
    console.error("No valid transcript items found after validation");
    return [];
  }

  if (validatedTranscript.length !== transcript.length) {
    console.warn(
      `Filtered ${transcript.length - validatedTranscript.length} invalid transcript items`
    );
  }

  const sentences: FormattedSentence[] = [];
  let currentSentence = "";
  let sentenceStartTime = 0;
  let hasStartedSentence = false;

  // Helper function to decode HTML entities
  function decodeHtmlEntities(text: string): string {
    // Add type checking to handle potential data corruption from cache
    if (typeof text !== "string") {
      console.error(
        "decodeHtmlEntities received non-string value:",
        typeof text,
        text
      );
      return String(text || "");
    }

    return text
      .replace(/&amp;/g, "&")
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"');
  }

  // Helper function to estimate timing within a fragment based on character position
  function estimateTimestamp(
    fragment: TranscriptItem,
    charPosition: number,
    totalChars: number
  ): number {
    if (totalChars === 0) return fragment.offset;
    const progressRatio = charPosition / totalChars;
    return fragment.offset + fragment.duration * progressRatio;
  }

  // Helper function to create a sentence object
  function createSentence(
    text: string,
    startTime: number,
    endTime: number,
    lang: string
  ): FormattedSentence {
    return {
      text: text.trim(),
      startTime,
      endTime,
      duration: endTime - startTime,
      lang,
    };
  }

  // Helper function to find sentence boundaries within text
  function findSentenceBoundaries(
    text: string
  ): { position: number; char: string }[] {
    const boundaries = [];
    const sentenceEnders = /[.!?]+/g;
    let match;

    while ((match = sentenceEnders.exec(text)) !== null) {
      const afterPunctuation = text
        .substring(match.index + match[0].length)
        .trim();

      // If there's text after the punctuation and it starts with a capital letter or number,
      // or if it's at the end of the text, consider it a sentence boundary
      if (afterPunctuation === "" || /^[A-Z0-9]/.test(afterPunctuation)) {
        boundaries.push({
          position: match.index + match[0].length,
          char: match[0],
        });
      }
    }

    return boundaries;
  }

  // Process each transcript item
  for (let i = 0; i < validatedTranscript.length; i++) {
    const item = validatedTranscript[i];

    // Debug: Log item structure for the first few items
    if (i < 3) {
      console.log(`Transcript item ${i}:`, {
        text: item.text,
        textType: typeof item.text,
        itemStructure: Object.keys(item),
        fullItem: item,
      });
    }

    const decodedText = decodeHtmlEntities(item.text);
    const trimmedText = decodedText.trim();

    // If this is the start of a new sentence, record the start time
    if (!hasStartedSentence) {
      sentenceStartTime = item.offset;
      hasStartedSentence = true;
    }

    // Add space before appending if currentSentence is not empty
    if (
      currentSentence &&
      !currentSentence.endsWith(" ") &&
      !trimmedText.startsWith(" ")
    ) {
      currentSentence += " ";
    }

    const sentenceBoundaries = findSentenceBoundaries(trimmedText);

    if (sentenceBoundaries.length > 0) {
      // Split the text at sentence boundaries
      let lastBoundary = 0;

      for (const boundary of sentenceBoundaries) {
        const sentencePart = trimmedText.substring(
          lastBoundary,
          boundary.position
        );
        currentSentence += sentencePart;

        // Calculate end time for this sentence
        const endTime = estimateTimestamp(
          item,
          boundary.position,
          trimmedText.length
        );

        // Create sentence if we have accumulated text
        if (currentSentence.trim()) {
          const sentence = createSentence(
            currentSentence,
            sentenceStartTime,
            endTime,
            item.lang || "en"
          );
          sentences.push(sentence);
        }

        // Reset for next sentence
        currentSentence = "";
        hasStartedSentence = false;
        lastBoundary = boundary.position;
      }

      // Handle any remaining text after the last boundary
      const remainingText = trimmedText.substring(lastBoundary).trim();
      if (remainingText) {
        currentSentence = remainingText;
        // Set start time for next sentence
        const startTime = estimateTimestamp(
          item,
          lastBoundary,
          trimmedText.length
        );
        sentenceStartTime = startTime;
        hasStartedSentence = true;
      }
    } else {
      // No sentence boundaries in this fragment, just add to current sentence
      currentSentence += trimmedText;
    }
  }

  // Handle any remaining text that didn't end with punctuation
  if (currentSentence.trim() && hasStartedSentence) {
    const lastItem = validatedTranscript[validatedTranscript.length - 1];
    const endTime = lastItem.offset + lastItem.duration;
    const sentence = createSentence(
      currentSentence,
      sentenceStartTime,
      endTime,
      lastItem.lang || "en"
    );
    sentences.push(sentence);
  }

  return sentences;
}

/**
 * Formats timestamp in seconds to HH:MM:SS format
 */
export function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  return [hours, minutes, secs]
    .map(val => val.toString().padStart(2, "0"))
    .join(":");
}

/**
 * Enhanced version that also provides formatted timestamps
 */
export function formatTranscriptWithTimestamps(
  transcript: TranscriptItem[]
): (FormattedSentence & {
  formattedStartTime: string;
  formattedEndTime: string;
})[] {
  const sentences = formatTranscriptIntoSentences(transcript);

  return sentences.map(sentence => ({
    ...sentence,
    formattedStartTime: formatTimestamp(sentence.startTime),
    formattedEndTime: formatTimestamp(sentence.endTime),
  }));
}
