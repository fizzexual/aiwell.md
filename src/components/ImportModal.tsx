import { useState } from "react";
import { useGraph } from "../store/useGraph";
import { parseAiwellBlock } from "../lib/parser";
import "./Modal.css";

const EXAMPLE = `---aiwell-node
title: Example Topic
model: Claude Sonnet 4.6
date: 2026-06-28
tags: example, demo
---
A brief summary of what was discussed in this session about this topic.

## Key points
- The main idea here
- A supporting detail

[[What is Aiwell]] [[Writing Nodes]]`;

export default function ImportModal() {
  const setShowImport = useGraph((s) => s.setShowImport);
  const addNode = useGraph((s) => s.addNode);
  const toast = useGraph((s) => s.toast);

  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleImport = () => {
    setError("");
    const parsed = parseAiwellBlock(text.trim());
    if (!parsed || !parsed.title || !parsed.content) {
      setError("Could not parse the aiwell-node block. Check the format.");
      return;
    }
    addNode({
      title: parsed.title ?? "Untitled",
      content: parsed.content ?? "",
      model: parsed.model ?? "unknown",
      date: parsed.date ?? new Date().toISOString().slice(0, 10),
      tags: parsed.tags ?? [],
      links: parsed.links ?? [],
    });
    toast(`Imported: ${parsed.title}`);
    setShowImport(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowImport(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Import Node</h3>
          <button className="modal-close" onClick={() => setShowImport(false)}>✕</button>
        </div>

        <div className="modal-body">
          <p className="modal-desc">
            Paste an <code>aiwell-node</code> block from any AI session below.
          </p>

          <textarea
            className="modal-textarea"
            placeholder={EXAMPLE}
            value={text}
            onChange={(e) => { setText(e.target.value); setError(""); }}
            autoFocus
            rows={16}
          />

          {error && <p className="modal-error">{error}</p>}

          <details className="modal-format">
            <summary>Format reference</summary>
            <pre className="modal-format-pre">{EXAMPLE}</pre>
          </details>
        </div>

        <div className="modal-footer">
          <button className="modal-btn" onClick={() => setShowImport(false)}>Cancel</button>
          <button
            className="modal-btn modal-btn--primary"
            onClick={handleImport}
            disabled={!text.trim()}
          >
            Import Node
          </button>
        </div>
      </div>
    </div>
  );
}
