import OpenAI from "openai";
import { env } from "@/app/config/env";
import { Logger } from "@/utils/logger";

const logger = new Logger("EmbeddingClient");

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

export interface EmbeddingData {
  text: string;
  embedding: number[];
  timestamp: string;
  videoId: string;
}

// Constants for optimization
const MAX_BATCH_SIZE = 100; // OpenAI's recommended batch size
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    logger.info("Generating embedding for text", { textLength: text.length });

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Fast and cost-effective
      input: text,
      encoding_format: "float",
      dimensions: 512, // Use smaller dimensions for faster processing
    });

    const embedding = response.data[0].embedding;
    logger.info("Embedding generated successfully", {
      embeddingDimensions: embedding.length,
    });

    return embedding;
  } catch (error) {
    logger.error("Failed to generate embedding", error);
    throw error;
  }
}

export async function generateBatchEmbeddings(
  texts: string[]
): Promise<number[][]> {
  try {
    logger.info("Generating batch embeddings", { count: texts.length });

    // If batch is small enough, process directly
    if (texts.length <= MAX_BATCH_SIZE) {
      return await generateBatchEmbeddingsChunk(texts);
    }

    // For large batches, process in parallel chunks
    logger.info("Processing large batch in chunks", {
      totalTexts: texts.length,
      chunkSize: MAX_BATCH_SIZE,
    });

    const chunks: string[][] = [];
    for (let i = 0; i < texts.length; i += MAX_BATCH_SIZE) {
      chunks.push(texts.slice(i, i + MAX_BATCH_SIZE));
    }

    // Process chunks in parallel with limited concurrency
    const maxConcurrentChunks = 3; // Prevent rate limiting
    const allEmbeddings: number[][] = [];

    for (let i = 0; i < chunks.length; i += maxConcurrentChunks) {
      const currentChunks = chunks.slice(i, i + maxConcurrentChunks);

      const chunkPromises = currentChunks.map(chunk =>
        generateBatchEmbeddingsChunk(chunk)
      );

      const chunkResults = await Promise.all(chunkPromises);
      allEmbeddings.push(...chunkResults.flat());
    }

    logger.info("Batch embeddings generated successfully", {
      count: allEmbeddings.length,
      chunks: chunks.length,
    });

    return allEmbeddings;
  } catch (error) {
    logger.error("Failed to generate batch embeddings", error);
    throw error;
  }
}

// Helper function to generate embeddings for a single chunk with retry logic
async function generateBatchEmbeddingsChunk(
  texts: string[],
  retryCount: number = 0
): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
      dimensions: 512, // Smaller dimensions for faster processing
    });

    return response.data.map(item => item.embedding);
  } catch (error) {
    logger.warn(
      `Chunk embedding failed (attempt ${retryCount + 1}/${MAX_RETRIES})`,
      {
        error: error instanceof Error ? error.message : "Unknown error",
        textsCount: texts.length,
      }
    );

    // Retry with exponential backoff
    if (retryCount < MAX_RETRIES - 1) {
      const delay = RETRY_DELAY_MS * Math.pow(2, retryCount);
      logger.info(`Retrying in ${delay}ms...`);

      await new Promise(resolve => setTimeout(resolve, delay));
      return generateBatchEmbeddingsChunk(texts, retryCount + 1);
    }

    throw error;
  }
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
