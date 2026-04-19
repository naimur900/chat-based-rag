const SEPARATORS = ["\n## ", "\n### ", "\n\n", "\n", ". ", " ", ""]; // Recursive splitter that respects markdown structure. It tries to split on headings first, then paragraphs, then sentences, then words.

export function chunkText(
  text: string,
  chunkSize = 800,
  chunkOverlap = 100,
): string[] {
  const chunks = recursiveSplit(text, chunkSize, SEPARATORS);
  return addOverlap(chunks, chunkOverlap);
}

function recursiveSplit(
  text: string,
  chunkSize: number,
  seps: string[],
): string[] {
  if (text.length <= chunkSize) return [text.trim()].filter(Boolean);

  const [sep, ...rest] = seps;
  const pieces = sep ? text.split(sep) : Array.from(text);
  const out: string[] = [];
  let current = "";

  for (const piece of pieces) {
    const candidate = current ? current + sep + piece : piece;
    if (candidate.length <= chunkSize) {
      current = candidate;
    } else {
      if (current) out.push(current);
      if (piece.length > chunkSize && rest.length) {
        out.push(...recursiveSplit(piece, chunkSize, rest));
        current = "";
      } else {
        current = piece;
      }
    }
  }
  if (current) out.push(current);
  return out.map((c) => c.trim()).filter(Boolean);
}

function addOverlap(chunks: string[], overlap: number): string[] {
  if (overlap <= 0 || chunks.length < 2) return chunks;
  return chunks.map((chunk, i) => {
    if (i === 0) return chunk;
    const prev = chunks[i - 1];
    const tail = prev.slice(Math.max(0, prev.length - overlap));
    return tail + " " + chunk;
  });
}
