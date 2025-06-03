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

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    logger.info("Generating embedding for text", { textLength: text.length });

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small", // Fast and cost-effective
      input: text,
      encoding_format: "float",
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

    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
    });

    const embeddings = response.data.map(item => item.embedding);
    logger.info("Batch embeddings generated successfully", {
      count: embeddings.length,
    });

    return embeddings;
  } catch (error) {
    logger.error("Failed to generate batch embeddings", error);
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
