import type { AiwellNode } from "../store/useGraph";

export const SEED_NODES: AiwellNode[] = [
  {
    id: "what-is-aiwell",
    title: "What is Aiwell",
    content: `Aiwell is a local-first AI memory system — a knowledge graph that grows with every conversation.

After each significant exchange, an AI writes a structured node here: what was discussed, what was decided, what was learned. Over time the graph becomes a living map of shared context between you and your AI tools.

## How it works

Each **node** is a focused summary of one topic, written by an AI after a session. Nodes link to each other with [[wikilinks]], forming a navigable knowledge graph.

The graph is stored locally in your browser's localStorage — private, offline, and instant.

## Key ideas

- Every AI session adds to the graph
- Nodes connect via [[wikilinks]]
- The graph is color-coded by model
- Import nodes from any AI using the aiwell-node format

[[Writing Nodes]] [[Knowledge Graph]] [[Aiwell Skill]]`,
    model: "claude-sonnet-4-6",
    date: "2026-06-28",
    tags: ["overview", "getting-started"],
    links: ["writing-nodes", "knowledge-graph", "aiwell-skill"],
  },
  {
    id: "knowledge-graph",
    title: "Knowledge Graph",
    content: `The knowledge graph is the core of Aiwell — a force-directed visualization where every node is a topic and every edge is a [[wikilink]] connection.

## Graph layout

Nodes repel each other and edges pull connected nodes together, settling into a layout that reflects semantic proximity. Frequently linked topics cluster naturally near each other.

## Node colors

Colors identify the source model:
- **Violet** — Claude (Anthropic)
- **Green** — GPT (OpenAI)
- **Blue** — Gemini (Google)
- **Cyan** — manually added
- **Amber** — other / unknown

## Interaction

- **Click** a node to open it in the panel
- **Drag** to rearrange
- **Scroll** to zoom
- **Double-click** the canvas to add a node

[[What is Aiwell]] [[Writing Nodes]] [[Wikilinks]]`,
    model: "claude-sonnet-4-6",
    date: "2026-06-28",
    tags: ["graph", "visualization"],
    links: ["what-is-aiwell", "writing-nodes", "wikilinks"],
  },
  {
    id: "writing-nodes",
    title: "Writing Nodes",
    content: `A node is a focused AI-written summary of one topic. The format is designed to be easy for any AI to produce and easy for Aiwell to parse.

## Aiwell-node format

\`\`\`
---aiwell-node
title: Topic Title
model: Claude Sonnet 4.6
date: 2026-06-28
tags: tag1, tag2
---
Content here — 2-5 sentences summarizing what was discussed.

## Key points
- Point one
- Point two

[[Related Topic]] [[Another Node]]
\`\`\`

## Guidelines

- One focused topic per node
- Use [[wikilinks]] to connect related ideas
- Include a model name so the graph can color-code it
- Write in a way that's useful to the next AI reading this context

## Import

Press **Ctrl+I** (or click the Import button) to paste a node block.

[[Aiwell Skill]] [[Wikilinks]] [[Knowledge Graph]]`,
    model: "claude-sonnet-4-6",
    date: "2026-06-28",
    tags: ["format", "how-to"],
    links: ["aiwell-skill", "wikilinks", "knowledge-graph"],
  },
  {
    id: "aiwell-skill",
    title: "Aiwell Skill",
    content: `The Aiwell skill is a Claude Code skill file that instructs any AI to write knowledge nodes after each session.

## Installation

Place the skill file in:
\`\`\`
~/.claude/skills/write-to-aiwell.md
\`\`\`

Or invoke it manually with \`/write-to-aiwell\` in Claude Code.

## What the skill does

1. Summarizes the key topics from the current session
2. Formats them as aiwell-node blocks
3. Writes the file to disk (Claude Code) or outputs it for pasting (other AIs)

## Using with other AIs

Paste the skill's "system prompt" section into any AI's system prompt or instructions. It works with ChatGPT, Gemini, or any other model — they just output the aiwell-node block and you paste it here.

[[Writing Nodes]] [[What is Aiwell]] [[Knowledge Graph]]`,
    model: "claude-sonnet-4-6",
    date: "2026-06-28",
    tags: ["skill", "claude-code", "setup"],
    links: ["writing-nodes", "what-is-aiwell", "knowledge-graph"],
  },
  {
    id: "wikilinks",
    title: "Wikilinks",
    content: `Wikilinks connect nodes in the knowledge graph. Any text in \`[[double brackets]]\` becomes a link to a node with that title.

## Syntax

\`\`\`
[[Node Title]]
\`\`\`

Links are case-insensitive and resolve by matching node titles. A link to a non-existent node is shown as a dashed edge — a "ghost" node — indicating a topic worth writing about.

## How links become edges

When Aiwell parses a node's content, it extracts all \`[[...]]\` patterns and resolves them to node IDs. These become the graph edges you see in the visualization.

## Best practice

Link generously — the more connections in the graph, the more useful and navigable it becomes. Think of each link as a hint that two topics share context.

[[Knowledge Graph]] [[Writing Nodes]]`,
    model: "claude-sonnet-4-6",
    date: "2026-06-28",
    tags: ["links", "format"],
    links: ["knowledge-graph", "writing-nodes"],
  },
];
