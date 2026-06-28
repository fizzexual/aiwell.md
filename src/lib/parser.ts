import type { AiwellNode } from "../store/useGraph";

export function parseWikilinks(content: string): string[] {
  const matches = content.matchAll(/\[\[([^\]]+)\]\]/g);
  return [...matches].map((m) => slugify(m[1]));
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function parseAiwellBlock(raw: string): Partial<AiwellNode> | null {
  const match = raw.match(/---aiwell-node\s*([\s\S]*?)---\s*([\s\S]*)/);
  if (!match) return null;

  const frontmatter = match[1];
  const content = match[2].trim();

  const get = (key: string) => {
    const m = frontmatter.match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
    return m ? m[1].trim() : "";
  };

  const title = get("title");
  if (!title) return null;

  const tagsRaw = get("tags");
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    title,
    model: get("model") || "unknown",
    date: get("date") || new Date().toISOString().slice(0, 10),
    tags,
    content,
    links: parseWikilinks(content),
  };
}

export function inferModelColor(model: string): string {
  const m = model.toLowerCase();
  if (m.includes("claude")) return "claude";
  if (m.includes("gpt") || m.includes("openai")) return "gpt";
  if (m.includes("gemini") || m.includes("google")) return "gemini";
  if (m === "manual") return "manual";
  return "other";
}
