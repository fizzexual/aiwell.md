# Aiwell 🍂

A desktop app that turns notes written by AI assistants into a browsable knowledge graph.

## About

Aiwell collects short "knowledge nodes" (title, model, date, tags, a summary and `[[wikilinks]]`) that an
AI writes at the end of a work session, and shows them as a linked, force-directed graph so the next
session can pick up the context quickly. It is for people who work with AI coding assistants such as
Claude Code and want a local, file-based memory of what was decided and learned. It is an early
prototype (v0.1.0): the app and the node format work, but there are no releases or installers yet.

## Features

- Force-directed knowledge graph (d3) with zoom, drag, node shading by number of links, and
  highlighting of a node's connections
- Nodes are plain markdown files in `~/.aiwell/nodes/*.md`; the app watches the folder and reloads
  when files change
- `[[Wikilinks]]` in node content become edges between nodes
- Sidebar search and filters by model and tag
- Node detail view with rendered markdown, edit and delete
- Add a node by hand, or import one by pasting an `---aiwell-node` block
- [`skill/write-to-aiwell.md`](skill/write-to-aiwell.md): instructions an AI (e.g. a Claude Code
  skill or a custom system prompt) follows to write nodes in the right format

## Getting started

Requires Node.js and the [Tauri 2 prerequisites](https://tauri.app/start/prerequisites/) (Rust toolchain).

```bash
npm install
npm run tauri dev     # run the desktop app
npm run tauri build   # build installers
```

`npm run dev` starts only the web frontend on port 1430; file storage works only inside the Tauri app.

## Tech stack

Tauri 2 (Rust) · React 19 · TypeScript · Vite · Zustand · d3-force / d3-zoom · marked
