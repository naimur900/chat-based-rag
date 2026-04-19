// lib/vectorStore.ts
import { Index } from "@upstash/vector";

export interface ChunkMetadata {
  text: string;
  source: string;
  chunkIndex: number;
  [key: string]: any;
}

function getIndex() {
  return new Index<ChunkMetadata>({
    url: process.env.UPSTASH_VECTOR_REST_URL!,
    token: process.env.UPSTASH_VECTOR_REST_TOKEN!,
  });
}

export async function upsertChunks(
  items: { id: string; vector: number[]; metadata: ChunkMetadata }[],
) {
  await getIndex().upsert(items);
}

export async function queryChunks(vector: number[], topK = 5) {
  return getIndex().query({ vector, topK, includeMetadata: true });
}

export async function resetIndex() {
  await getIndex().reset();
}
