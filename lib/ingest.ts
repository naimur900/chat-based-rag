// This is the one-time (well, every-time-you-change-docs) script that reads your markdown, chunks it, embeds it, and uploads it.

// scripts/ingest.ts
import "dotenv/config";
import matter from "gray-matter";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { chunkText } from "../lib/chunking";
import { embed } from "../lib/embeddings";
import {
  resetIndex,
  upsertChunks,
  type ChunkMetadata,
} from "../lib/vectorStore";

const DOCS_DIR = join(process.cwd(), "docs");
const BATCH = 50;

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (e) => {
      const full = join(dir, e.name);
      if (e.isDirectory()) return walk(full);
      return e.name.endsWith(".md") || e.name.endsWith(".mdx") ? [full] : [];
    }),
  );
  return nested.flat();
}

async function main() {
  console.log("🔄 Resetting index...");
  await resetIndex();

  const files = await walk(DOCS_DIR);
  console.log(`📂 Found ${files.length} markdown files`);

  const items: { id: string; vector: number[]; metadata: ChunkMetadata }[] = [];

  for (const file of files) {
    const raw = await readFile(file, "utf-8");
    const { content, data } = matter(raw);
    const source = relative(DOCS_DIR, file);
    const chunks = chunkText(content, 800, 100);
    console.log(`   ${source}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i += BATCH) {
      const batch = chunks.slice(i, i + BATCH);
      const vectors = await embed(batch);
      batch.forEach((text, j) => {
        const chunkIndex = i + j;
        items.push({
          id: `${source}::${chunkIndex}`,
          vector: vectors[j],
          metadata: {
            text,
            source,
            chunkIndex,
            title: data.title ?? source,
            category: data.category ?? "general",
          },
        });
      });
    }
  }

  console.log(`⬆️  Upserting ${items.length} chunks...`);
  for (let i = 0; i < items.length; i += BATCH) {
    await upsertChunks(items.slice(i, i + BATCH));
  }
  console.log("✅ Done!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
