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
      return `[Context ${i + 1}]\n${m.text}`;
    })
    .join("\n\n---\n\n");

  const system = `You are a senior software engineer assistant specializing in best practices, design patterns, and software architecture.

Answer using ONLY the context below. If the context doesn't contain the answer, say "I don't have that in my knowledge base" — do not invent information.

Do not mention, cite, or reference the context or "sources" in your answer — just answer the question directly.

FORMATTING (respond in GitHub-Flavored Markdown; it is rendered in the UI):
- Lead with a short plain-language answer, then add structure as needed.
- Use Markdown tables when comparing options across several dimensions — they render properly in the UI.
- Use headings, bullet/numbered lists, and **bold** for genuine emphasis where they aid readability.
- Use \`inline code\` for identifiers and class names, and fenced code blocks (with a language) for multi-line code.
- Keep it clear and well-organized; don't pad a simple answer into an exhaustive report.

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
