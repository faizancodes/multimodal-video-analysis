import {
  formatTranscriptIntoSentences,
  formatTranscriptWithTimestamps,
  formatTimestamp,
} from "./transcriptFormatter";

// Sample data from your example
const sampleTranscript = [
  {
    text: "One of the weird things about startups",
    duration: 3.12,
    offset: 0.08,
    lang: "en",
  },
  {
    text: "is that you don&amp;#39;t win an award for doing",
    duration: 3.52,
    offset: 1.52,
    lang: "en",
  },
  {
    text: "the same wrong thing for longer. Down",
    duration: 3.119,
    offset: 3.2,
    lang: "en",
  },
  {
    text: "the line when you fail, none of them",
    duration: 3.12,
    offset: 5.04,
    lang: "en",
  },
  {
    text: "will care. So excited to welcome one of",
    duration: 3.761,
    offset: 6.319,
    lang: "en",
  },
  {
    text: "the hottest, most talked about startups",
    duration: 4.24,
    offset: 8.16,
    lang: "en",
  },
  {
    text: "from the valley, Windsurf and their CEO,",
    duration: 4.24,
    offset: 10.08,
    lang: "en",
  },
  {
    text: "Verun. Companies that are usually first",
    duration: 3.92,
    offset: 12.4,
    lang: "en",
  },
  {
    text: "to a new paradigm are companies that are",
    duration: 3.52,
    offset: 14.32,
    lang: "en",
  },
  {
    text: "willing to disrupt themselves. When you",
    duration: 3.6,
    offset: 16.32,
    lang: "en",
  },
  {
    text: "have a new great idea, even the crappy",
    duration: 3.92,
    offset: 17.84,
    lang: "en",
  },
  {
    text: "version of that idea is already amazing.",
    duration: 3.519,
    offset: 19.92,
    lang: "en",
  },
];

// Test the formatting function
console.log("=== Testing formatTranscriptIntoSentences ===");
const formattedSentences = formatTranscriptIntoSentences(sampleTranscript);
console.log(
  "Formatted sentences:",
  JSON.stringify(formattedSentences, null, 2)
);

console.log("\n=== Testing formatTranscriptWithTimestamps ===");
const sentencesWithTimestamps =
  formatTranscriptWithTimestamps(sampleTranscript);
console.log(
  "Sentences with timestamps:",
  JSON.stringify(sentencesWithTimestamps, null, 2)
);

console.log("\n=== Manual Verification ===");
sentencesWithTimestamps.forEach((sentence, index) => {
  console.log(`Sentence ${index + 1}:`);
  console.log(`  Text: "${sentence.text}"`);
  console.log(
    `  Start: ${sentence.formattedStartTime} (${sentence.startTime}s)`
  );
  console.log(`  End: ${sentence.formattedEndTime} (${sentence.endTime}s)`);
  console.log(`  Duration: ${sentence.duration}s`);
  console.log("");
});

export { sampleTranscript };
