import type { AiwellNode } from "../store/useGraph";
import { slugify } from "./parser";

export function getNode(nodes: AiwellNode[], id: string): AiwellNode | undefined {
  return nodes.find((n) => n.id === id);
}

export function resolveTitle(nodes: AiwellNode[], title: string): string | null {
  const slug = slugify(title);
  const exact = nodes.find((n) => n.id === slug);
  if (exact) return exact.id;
  return nodes.find((n) => n.title.toLowerCase() === title.toLowerCase())?.id ?? null;
}

export function backlinks(nodes: AiwellNode[], id: string): AiwellNode[] {
  return nodes.filter((n) => n.links.includes(id));
}
