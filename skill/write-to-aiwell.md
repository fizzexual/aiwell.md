# Write to Aiwell

After completing a session or significant task, write one or more **knowledge nodes** to the Aiwell knowledge graph. This gives the next AI (or the next session) instant context on what was discussed, decided, and learned — without having to re-read the full conversation.

---

## When to write

Write a node whenever the session covers a topic worth remembering:

- After implementing a feature or fixing a bug
- After explaining a concept or architecture decision
- After debugging a complex issue
- After researching something new
- After any significant decision with non-obvious reasoning

---

## Node format

Output the block **exactly** like this (the `---aiwell-node` fence is required):

```
---aiwell-node
title: [Short, specific topic title — 3–7 words]
model: [Your model name, e.g. Claude Sonnet 4.6]
date: [Today's date, YYYY-MM-DD]
tags: [tag1, tag2, tag3]
---
[2–4 sentence summary of what was discussed, decided, or learned about this topic.
Write in present tense. Be specific — generic summaries are not useful.]

## Key points
- [Most important takeaway]
- [Second point]
- [Third point if needed]

[[Related Node Title]] [[Another Related Node]]
```

---

## Rules

1. **One node per topic.** If the session covered 3 topics, write 3 separate blocks.
2. **Be specific.** "Fixed the CORS issue in the API middleware" is better than "Fixed a bug".
3. **Use [[wikilinks]]** to connect to other nodes. Think about what a future AI would want to navigate to from this node.
4. **Keep it short.** The summary section should be 2–4 sentences. Key points: 2–4 bullets.
5. **Always include model + date** so the graph can color-code and sort your nodes.

---

## Claude Code: write to disk

If you have the **Write** tool available (Claude Code), also write the node to disk so Aiwell can sync it:

```
~/.aiwell/nodes/[slug].md
```

Where `[slug]` is the title lowercased with spaces replaced by hyphens (e.g. `fixing-cors-api.md`).

The file content is the raw aiwell-node block (no extra wrapper needed).

---

## For other AIs (ChatGPT, Gemini, etc.)

Add this to your system prompt / custom instructions:

> After each significant response, output one or more aiwell-node blocks (see format above).
> The user will copy these into the Aiwell app (Ctrl+I) to build their knowledge graph.

---

## Example

```
---aiwell-node
title: Fixing CORS in Express API
model: Claude Sonnet 4.6
date: 2026-06-28
tags: express, cors, backend
---
The Express API was rejecting requests from the Vite dev server because CORS headers
were missing. Adding the `cors` middleware before route definitions fixed it.
The `credentials: true` option must be set when cookies are involved.

## Key points
- Install `cors` npm package and apply `app.use(cors({ origin, credentials }))`
- Order matters: cors middleware must come before routes
- For cookie-based auth, both `credentials: true` and the exact origin (not `*`) are required

[[Express API]] [[Authentication]] [[Vite Dev Server]]
```

---

## Tips

- Use **past tense for what happened**, present tense for **how things work**
- A good title completes the sentence: "This node is about ___"
- Ghost links (linking to non-existent nodes) are fine — they show up as targets to write next
