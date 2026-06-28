import { useState, useMemo } from "react";
import { useGraph } from "../store/useGraph";
import { renderMarkdown } from "../lib/markdown";
import { inferModelColor } from "../lib/parser";
import { getNode as findNode, resolveTitle as resolveNodeTitle } from "../lib/nodeUtils";
import "./NodePanel.css";

const MODEL_COLOR: Record<string, string> = {
  claude: "#7c3aed",
  gpt: "#10b981",
  gemini: "#3b82f6",
  manual: "#06b6d4",
  other: "#f59e0b",
};

export default function NodePanel() {
  const selectedId = useGraph((s) => s.selectedId);
  const nodes = useGraph((s) => s.nodes);
  const updateNode = useGraph((s) => s.updateNode);
  const deleteNode = useGraph((s) => s.deleteNode);
  const selectNode = useGraph((s) => s.selectNode);
  const toast = useGraph((s) => s.toast);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const node = useMemo(() => selectedId ? findNode(nodes, selectedId) : undefined, [nodes, selectedId]);
  const bl = useMemo(
    () => (selectedId ? nodes.filter((n) => n.links.includes(selectedId)) : []),
    [nodes, selectedId]
  );

  const html = useMemo(() => {
    if (!node) return "";
    return renderMarkdown(node.content, (title) => resolveNodeTitle(nodes, title));
  }, [node, nodes]);

  if (!node) {
    return (
      <aside className="node-panel node-panel--empty">
        <div className="panel-empty-msg">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="3"/><circle cx="4" cy="7" r="2"/><circle cx="20" cy="7" r="2"/>
            <circle cx="4" cy="17" r="2"/><circle cx="20" cy="17" r="2"/>
            <line x1="12" y1="12" x2="4"  y2="7" /><line x1="12" y1="12" x2="20" y2="7" />
            <line x1="12" y1="12" x2="4"  y2="17"/><line x1="12" y1="12" x2="20" y2="17"/>
          </svg>
          <p>Select a node to read it</p>
        </div>
      </aside>
    );
  }

  const kind = inferModelColor(node.model);
  const dotColor = MODEL_COLOR[kind] ?? MODEL_COLOR.other;

  const startEdit = () => {
    setDraft(node.content);
    setEditing(true);
  };

  const saveEdit = () => {
    updateNode(node.id, { content: draft });
    setEditing(false);
    toast("Node updated");
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("[data-node-id]");
    if (a) {
      e.preventDefault();
      selectNode((a as HTMLElement).dataset.nodeId ?? null);
    }
  };

  return (
    <aside className="node-panel">
      <div className="panel-header">
        <div className="panel-header-top">
          <span className="panel-model-dot" style={{ background: dotColor }} />
          <h2 className="panel-title">{node.title}</h2>
        </div>
        <div className="panel-meta">
          <span className="panel-model">{node.model}</span>
          <span className="panel-date">{node.date}</span>
        </div>
        {node.tags.length > 0 && (
          <div className="panel-tags">
            {node.tags.map((t) => (
              <span key={t} className="panel-tag">#{t}</span>
            ))}
          </div>
        )}
        <div className="panel-actions">
          {editing ? (
            <>
              <button className="panel-btn panel-btn--save" onClick={saveEdit}>Save</button>
              <button className="panel-btn" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="panel-btn" onClick={startEdit}>Edit</button>
              <button
                className="panel-btn panel-btn--delete"
                onClick={() => {
                  deleteNode(node.id);
                  toast("Node deleted");
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      <div className="panel-body">
        {editing ? (
          <textarea
            className="panel-editor"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        ) : (
          <div
            className="panel-content prose"
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={handleLinkClick}
          />
        )}
      </div>

      {(node.links.length > 0 || bl.length > 0) && !editing && (
        <div className="panel-links">
          {node.links.length > 0 && (
            <div className="link-section">
              <span className="link-section-label">Links to</span>
              <div className="link-chips">
                {node.links.map((lid) => {
                  const target = findNode(nodes, lid);
                  if (!target) return null;
                  const tk = inferModelColor(target.model);
                  return (
                    <button
                      key={lid}
                      className="link-chip"
                      style={{ "--dot": MODEL_COLOR[tk] ?? MODEL_COLOR.other } as React.CSSProperties}
                      onClick={() => selectNode(lid)}
                    >
                      <span className="link-chip-dot" />
                      {target.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {bl.length > 0 && (
            <div className="link-section">
              <span className="link-section-label">Backlinks</span>
              <div className="link-chips">
                {bl.map((n) => {
                  const tk = inferModelColor(n.model);
                  return (
                    <button
                      key={n.id}
                      className="link-chip"
                      style={{ "--dot": MODEL_COLOR[tk] ?? MODEL_COLOR.other } as React.CSSProperties}
                      onClick={() => selectNode(n.id)}
                    >
                      <span className="link-chip-dot" />
                      {n.title}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
