import { marked } from "marked";

export function renderMarkdown(
  content: string,
  resolveLink: (title: string) => string | null,
): string {
  // Replace [[wikilinks]] before marked processes the text
  const withLinks = content.replace(/\[\[([^\]]+)\]\]/g, (_, title) => {
    const id = resolveLink(title);
    if (id) {
      return `<a href="#" data-node-id="${id}" class="aw-wikilink">${title}</a>`;
    }
    return `<span class="aw-wikilink-missing">${title}</span>`;
  });

  return marked.parse(withLinks) as string;
}
