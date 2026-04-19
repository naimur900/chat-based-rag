import { GoogleGenAI } from "@google/genai";
// import OpenAI from "openai";
// const OLLAMA_URL = process.env.OLLAMA_LOCAL_URL ?? "http://localhost:11434";

function getGenai() {
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}
// function getOpenAI() { return new OpenAI({ apiKey: process.env.OPENAI_API_KEY }); }

function l2Normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return norm === 0 ? vec : vec.map((v) => v / norm);
}

export async function embed(texts: string[]): Promise<number[][]> {
  const results = await Promise.all(
    texts.map((text) =>
      getGenai().models.embedContent({
        model: "gemini-embedding-001",
        contents: text,
        config: { outputDimensionality: 1536 },
      }),
    ),
  );
  return results.map((res) => l2Normalize(res.embeddings![0].values!));

  // for openAI embedding model
  //   const res = await openai.embeddings.create({
  //     model: "text-embedding-3-small",
  //     input: texts,
  //   });
  //   return res.data.map((d) => d.embedding);

  // to run the embedding model locally while doing embedding on ingestion
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
