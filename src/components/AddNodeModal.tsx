import { useState } from "react";
import { useGraph } from "../store/useGraph";
import "./Modal.css";

export default function AddNodeModal() {
  const setShowAdd = useGraph((s) => s.setShowAdd);
  const addNode = useGraph((s) => s.addNode);
  const toast = useGraph((s) => s.toast);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [model, setModel] = useState("manual");
  const [tags, setTags] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!title.trim()) { setError("Title is required"); return; }
    if (!content.trim()) { setError("Content is required"); return; }
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    addNode({
      title: title.trim(),
      content: content.trim(),
      model: model || "manual",
      date: new Date().toISOString().slice(0, 10),
      tags: tagList,
      links: [],
    });
    toast(`Added: ${title.trim()}`);
    setShowAdd(false);
  };

  return (
    <div className="modal-overlay" onClick={() => setShowAdd(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Add Node</h3>
          <button className="modal-close" onClick={() => setShowAdd(false)}>✕</button>
        </div>

        <div className="modal-body">
          <div className="modal-field">
            <label>Title</label>
            <input
              className="modal-input"
              placeholder="Node title..."
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              autoFocus
            />
          </div>

          <div className="modal-row">
            <div className="modal-field">
              <label>Model</label>
              <input
                className="modal-input"
                placeholder="manual"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>Tags (comma-separated)</label>
              <input
                className="modal-input"
                placeholder="tag1, tag2"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-field">
            <label>Content (supports markdown + [[wikilinks]])</label>
            <textarea
              className="modal-textarea modal-textarea--sm"
              placeholder="Write the node content here..."
              value={content}
              onChange={(e) => { setContent(e.target.value); setError(""); }}
              rows={10}
            />
          </div>

          {error && <p className="modal-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="modal-btn" onClick={() => setShowAdd(false)}>Cancel</button>
          <button
            className="modal-btn modal-btn--primary"
            onClick={handleAdd}
            disabled={!title.trim() || !content.trim()}
          >
            Add Node
          </button>
        </div>
      </div>
    </div>
  );
}
