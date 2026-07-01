import { useState, useMemo, useEffect } from "react";
import { useGraph } from "../store/useGraph";
import { renderMarkdown } from "../lib/markdown";
import { getNode as findNode } from "../lib/nodeUtils";
import "./NodeModal.css";

export default function NodeModal() {
  const selectedId       = useGraph((s) => s.selectedId);
  const nodes            = useGraph((s) => s.nodes);
  const updateNode       = useGraph((s) => s.updateNode);
  const deleteNode       = useGraph((s) => s.deleteNode);
  const selectNode       = useGraph((s) => s.selectNode);
  const setShowNodeModal = useGraph((s) => s.setShowNodeModal);
  const toast            = useGraph((s) => s.toast);

  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState("");

  const node = useMemo(() => (selectedId ? findNode(nodes, selectedId) : undefined), [nodes, selectedId]);
  const bl   = useMemo(
    () => (selectedId ? nodes.filter((n) => n.links.includes(selectedId)) : []),
    [nodes, selectedId]
  );

  const html = useMemo(() => {
    if (!node) return "";
    return renderMarkdown(node.content, (title) => {
      const lower = title.toLowerCase();
      return nodes.find((n) => n.id === lower || n.title.toLowerCase() === lower)?.id ?? null;
    });
  }, [node, nodes]);

  const close = () => { setShowNodeModal(false); setEditing(false); };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!node) return null;

  const startEdit = () => { setDraft(node.content); setEditing(true); };
  const saveEdit  = () => { updateNode(node.id, { content: draft }); setEditing(false); toast("Saved"); };

  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = (e.target as HTMLElement).closest("[data-node-id]");
    if (a) {
      e.preventDefault();
      const id = (a as HTMLElement).dataset.nodeId ?? null;
      selectNode(id);
      close();
    }
  };

  return (
    <div className="node-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) close(); }}>
      <div className="node-modal" role="dialog" aria-modal="true">
        <div className="node-modal-header">
          <div className="node-modal-eyebrow">{node.model} · {node.date}</div>
          <button className="node-modal-close" onClick={close} aria-label="Close">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        <div className="node-modal-scroll">
          <h1 className="node-modal-title">{node.title}</h1>

          {node.tags.length > 0 && (
            <div className="node-modal-tags">
              {node.tags.map((t) => <span key={t} className="tag-pill">#{t}</span>)}
            </div>
          )}

          <div className="node-modal-actions">
            {editing ? (
              <>
                <button className="open-btn" onClick={saveEdit}>Save</button>
                <button className="open-btn" onClick={() => setEditing(false)}>Cancel</button>
              </>
            ) : (
              <>
                <button className="open-btn" onClick={startEdit}>Edit</button>
                <button className="open-btn danger" onClick={() => { deleteNode(node.id); toast("Deleted"); close(); }}>Delete</button>
              </>
            )}
          </div>

          <div className="node-modal-divider" />

          {editing ? (
            <textarea
              className="node-modal-editor"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              autoFocus
            />
          ) : (
            <div
              className="node-modal-prose insp-prose"
              dangerouslySetInnerHTML={{ __html: html }}
              onClick={handleLinkClick}
            />
          )}

          {!editing && (node.links.length > 0 || bl.length > 0) && (
            <div className="node-modal-links">
              {node.links.length > 0 && (
                <div className="node-modal-link-group">
                  <p className="section-label">Links to</p>
                  <div className="link-list">
                    {node.links.map((lid, i) => {
                      const t = findNode(nodes, lid);
                      if (!t) return null;
                      return (
                        <button key={lid} className="link-row" style={{ animationDelay: `${i * 30}ms` }}
                          onClick={() => { selectNode(lid); close(); }}>
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

              {bl.length > 0 && (
                <div className="node-modal-link-group">
                  <p className="section-label">Backlinks</p>
                  <div className="link-list">
                    {bl.map((n, i) => (
                      <button key={n.id} className="link-row" style={{ animationDelay: `${i * 30}ms` }}
                        onClick={() => { selectNode(n.id); close(); }}>
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
          )}
        </div>
      </div>
    </div>
  );
}
