import type { AiwellNode } from "../store/useGraph";
import { parseAiwellBlock, slugify } from "./parser";

const NODES_DIR = ".aiwell/nodes";

export function isTauri(): boolean {
  return !!(window as Window & { __TAURI__?: unknown }).__TAURI__;
}

export function serializeNode(node: AiwellNode): string {
  return [
    "---aiwell-node",
    `title: ${node.title}`,
    `model: ${node.model}`,
    `date: ${node.date}`,
    `tags: ${node.tags.join(", ")}`,
    "---",
    "",
    node.content,
    "",
  ].join("\n");
}

export async function ensureDir(): Promise<void> {
  if (!isTauri()) return;
  const { exists, mkdir, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  if (!(await exists(NODES_DIR, { baseDir: BaseDirectory.Home }))) {
    await mkdir(NODES_DIR, { baseDir: BaseDirectory.Home, recursive: true });
  }
}

export async function loadAllNodes(): Promise<AiwellNode[]> {
  if (!isTauri()) return [];
  const { readDir, readTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  await ensureDir();
  const entries = await readDir(NODES_DIR, { baseDir: BaseDirectory.Home });
  const nodes: AiwellNode[] = [];
  for (const entry of entries) {
    if (!entry.name?.endsWith(".md")) continue;
    try {
      const text = await readTextFile(`${NODES_DIR}/${entry.name}`, {
        baseDir: BaseDirectory.Home,
      });
      const partial = parseAiwellBlock(text);
      if (partial?.title) {
        const id = entry.name.replace(/\.md$/, "");
        nodes.push({ id, links: [], ...partial } as AiwellNode);
      }
    } catch {
      // skip malformed files
    }
  }
  return nodes;
}

export async function writeNode(node: AiwellNode): Promise<void> {
  if (!isTauri()) return;
  const { writeTextFile, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  await ensureDir();
  await writeTextFile(`${NODES_DIR}/${node.id}.md`, serializeNode(node), {
    baseDir: BaseDirectory.Home,
  });
}

export async function deleteNodeFile(id: string): Promise<void> {
  if (!isTauri()) return;
  const { remove, BaseDirectory } = await import("@tauri-apps/plugin-fs");
  try {
    await remove(`${NODES_DIR}/${id}.md`, { baseDir: BaseDirectory.Home });
  } catch {
    // already gone
  }
}

export async function watchNodes(
  onChange: (nodes: AiwellNode[]) => void
): Promise<() => void> {
  if (!isTauri()) return () => {};
  const { watch } = await import("@tauri-apps/plugin-fs");
  const { homeDir } = await import("@tauri-apps/api/path");
  const home = await homeDir();
  const nodesPath = `${home.replace(/\\/g, "/")}/.aiwell/nodes`;

  let debounce: ReturnType<typeof setTimeout>;
  const unwatch = await watch(nodesPath, () => {
    clearTimeout(debounce);
    debounce = setTimeout(async () => {
      const nodes = await loadAllNodes();
      onChange(nodes);
    }, 150);
  });

  return () => { unwatch(); };
}

export async function seedToDisk(nodes: AiwellNode[]): Promise<void> {
  if (!isTauri()) return;
  for (const node of nodes) {
    await writeNode(node);
  }
}

/** Resolve wikilink title → node id among loaded nodes */
export function resolveTitle(nodes: AiwellNode[], title: string): string | null {
  const slug = slugify(title);
  const found = nodes.find((n) => n.id === slug || slugify(n.title) === slug);
  return found?.id ?? null;
}
