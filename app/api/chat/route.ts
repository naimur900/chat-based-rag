// app/api/chat/route.ts
import { embedOne } from "@/lib/embeddings";
import { queryChunks } from "@/lib/vectorStore";
import { createOpenAI } from "@ai-sdk/openai";
// import { anthropic } from "@ai-sdk/anthropic";
import { convertToModelMessages, streamText } from "ai";

const ollama = createOpenAI({
  baseURL: "https://ollama.com/v1",
  apiKey: process.env.OLLAMA_API_KEY,
});

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Grab the latest user message for retrieval
  const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
  const question: string =
    typeof lastUser?.content === "string"
      ? lastUser.content
      : (lastUser?.content?.[0]?.text ??
         lastUser?.parts?.find((p: any) => p.type === "text")?.text ??
         "");

  if (!question.trim()) {
    return new Response("No message provided", { status: 400 });
  }

  // 1. RETRIEVE
  const queryVec = await embedOne(question);
  const hits = await queryChunks(queryVec, 5);

  // 2. AUGMENT
  const context = hits
    .map((h, i) => {
      const m = h.metadata!;
      return `[Source ${i + 1}: ${m.source}]\n${m.text}`;
    })
    .join("\n\n---\n\n");

  const system = `You are a senior software engineer assistant specializing in best practices, design patterns, and software architecture.

Answer using ONLY the context below. If the context doesn't contain the answer, say "I don't have that in my knowledge base" — do not invent information.

Always cite sources inline like [Source 1], [Source 2] so users can verify.

FORMATTING RULES (follow strictly):
- Respond in clean, simple Markdown. Lead with a short plain-language explanation, then add structure only if it genuinely aids clarity.
- Prefer flowing prose and short paragraphs. Use bullet points sparingly, and keep each bullet to a single line where possible.
- Do NOT use tables.
- Do NOT use emoji or symbols like ✅ / ❌ / ⚠.
- Do NOT create bold-labeled section headers followed by nested numbered sub-lists (e.g. "**Purpose:**", "**When to choose it:**" with 1./2./3. underneath). Explain those points in prose instead.
- Do NOT bold-wrap every term or label. Use bold only for occasional, genuine emphasis.
- Keep nesting shallow — avoid lists inside lists.
- Use \`inline code\` for identifiers, class names, and short snippets, and fenced code blocks for multi-line code.
- Aim for a concise, readable answer, not an exhaustive formatted report.

CONTEXT:
${context}`;

  // 3. GENERATE (streaming)
  const result = streamText({
    model: ollama.chat("gpt-oss:120b"),
    // model: ollama.chat("qwen3.5:cloud"),
    // model: anthropic("claude-sonnet-4-5"),
    system,
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse({
    onError: (error) => (error instanceof Error ? error.message : String(error)),
  });
}
