// lib/embeddings.ts
import { GoogleGenAI } from "@google/genai";
// import OpenAI from "openai";
// const OLLAMA_URL = process.env.OLLAMA_LOCAL_URL ?? "http://localhost:11434";

const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function l2Normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return norm === 0 ? vec : vec.map((v) => v / norm);
}

export async function embed(texts: string[]): Promise<number[][]> {
  const res = await genai.models.embedContent({
    model: "gemini-embedding-001",
    contents: texts,
    config: { outputDimensionality: 1536 },
  });
  return res.embeddings!.map((e) => l2Normalize(e.values!));

  // for openAI embedding model
  //   const res = await openai.embeddings.create({
  //     model: "text-embedding-3-small",
  //     input: texts,
  //   });
  //   return res.data.map((d) => d.embedding);

  // To run the embedding model locally while performing embedding on ingestion
  //   const res = await fetch(`${OLLAMA_URL}/api/embed`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({
  //       model: "nomic-embed-text",
  //       input: texts,
  //     }),
  //   });

  //   if (!res.ok) throw new Error(`Ollama embed failed: ${res.status}`);
  //   const data = await res.json();
  //   return data.embeddings as number[][];
  // }
}

export async function embedOne(text: string): Promise<number[]> {
  const [v] = await embed([text]);
  return v;
}
