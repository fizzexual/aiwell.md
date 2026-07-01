import { useState, useMemo } from "react";
import { useGraph } from "../store/useGraph";
import { renderMarkdown } from "../lib/markdown";
import { getNode as findNode } from "../lib/nodeUtils";
import "./NodePanel.css";

export default function NodePanel() {
  const selectedId = useGraph((s) => s.selectedId);
  const nodes      = useGraph((s) => s.nodes);
  const updateNode = useGraph((s) => s.updateNode);
  const deleteNode = useGraph((s) => s.deleteNode);
  const selectNode = useGraph((s) => s.selectNode);
  const toast      = useGraph((s) => s.toast);

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState("");

  const node = useMemo(() => (selectedId ? findNode(nodes, selectedId) : undefined), [nodes, selectedId]);

  const bl = useMemo(
    () => (selectedId ? nodes.filter((n) => n.links.includes(selectedId)) : []),
    [nodes, selectedId]
  );

  const html = useMemo(() => {
    if (!node) return "";
    return renderMarkdown(node.content, (title) => {
      const t = title.toLowerCase();
      return nodes.find((n) => n.id === t || n.title.toLowerCase() === title.toLowerCase())?.id ?? null;
    });
  }, [node, nodes]);

  if (!node) {
    return (
      <aside className="inspector">
        <div className="inspector-empty">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
            <circle cx="12" cy="12" r="3"/>
            <circle cx="4" cy="7" r="2"/><circle cx="20" cy="7" r="2"/>
            <circle cx="4" cy="17" r="2"/><circle cx="20" cy="17" r="2"/>
            <line x1="12" y1="12" x2="4"  y2="7" /><line x1="12" y1="12" x2="20" y2="7" />
            <line x1="12" y1="12" x2="4"  y2="17"/><line x1="12" y1="12" x2="20" y2="17"/>
          </svg>
          Select a node to read it
        </div>
      </aside>
    );
  }

  const startEdit = () => { setDraft(node.content); setEditing(true); };
  const saveEdit  = () => { updateNode(node.id, { content: draft }); setEditing(false); toast("Saved"); };

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("[data-node-id]");
    if (a) { e.preventDefault(); selectNode((a as HTMLElement).dataset.nodeId ?? null); }
  };

  return (
    <aside className="inspector">
      <div className="insp-scroll">
        <p className="insp-eyebrow">{node.model}</p>
        <h2 className="insp-title">{node.title}</h2>
        <div className="insp-meta">
          <span>{node.date}</span>
          {node.links.length > 0 && <span>{node.links.length} link{node.links.length !== 1 ? "s" : ""}</span>}
          {bl.length > 0 && <span>{bl.length} backlink{bl.length !== 1 ? "s" : ""}</span>}
        </div>

        {node.tags.length > 0 && (
          <div className="insp-tags">
            {node.tags.map((t) => <span key={t} className="tag-pill">#{t}</span>)}
          </div>
        )}

        <div className="insp-actions">
          {editing ? (
            <>
              <button className="open-btn" onClick={saveEdit}>Save</button>
              <button className="open-btn" onClick={() => setEditing(false)}>Cancel</button>
            </>
          ) : (
            <>
              <button className="open-btn" onClick={startEdit}>Edit</button>
              <button className="open-btn danger" onClick={() => { deleteNode(node.id); toast("Deleted"); }}>Delete</button>
            </>
          )}
        </div>

        <div className="insp-divider" />

        {editing ? (
          <textarea
            className="insp-editor"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoFocus
          />
        ) : (
          <div
            className="insp-prose"
            dangerouslySetInnerHTML={{ __html: html }}
            onClick={handleLinkClick}
          />
        )}

        {!editing && node.links.length > 0 && (
          <div style={{ marginTop: 20 }}>
            <p className="section-label">Links to</p>
            <div className="link-list">
              {node.links.map((lid, i) => {
                const t = findNode(nodes, lid);
                if (!t) return null;
                return (
                  <button
                    key={lid}
                    className="link-row"
                    style={{ animationDelay: `${i * 30}ms` }}
                    onClick={() => selectNode(lid)}
                  >
                    <div className="link-text">
                      <span className="link-title">{t.title}</span>
                      <span className="link-kind">{t.model} · {t.date}</span>
                    </div>
                    <svg className="link-arrow" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {!editing && bl.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <p className="section-label">Backlinks</p>
            <div className="link-list">
              {bl.map((n, i) => (
                <button
                  key={n.id}
                  className="link-row"
                  style={{ animationDelay: `${i * 30}ms` }}
                  onClick={() => selectNode(n.id)}
                >
                  <div className="link-text">
                    <span className="link-title">{n.title}</span>
                    <span className="link-kind">{n.model} · {n.date}</span>
                  </div>
                  <svg className="link-arrow" width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
