import { useMemo } from "react";
import { useGraph } from "../store/useGraph";
import { inferModelColor } from "../lib/parser";
import "./Sidebar.css";

const MODEL_DOT: Record<string, string> = {
  claude: "var(--node-claude)",
  gpt: "var(--node-gpt)",
  gemini: "var(--node-gemini)",
  manual: "var(--node-manual)",
  other: "var(--node-other)",
};

export default function Sidebar() {
  const nodes = useGraph((s) => s.nodes);
  const selectedId = useGraph((s) => s.selectedId);
  const searchQuery = useGraph((s) => s.searchQuery);
  const filterModel = useGraph((s) => s.filterModel);
  const filterTag = useGraph((s) => s.filterTag);
  const setSearch = useGraph((s) => s.setSearch);
  const setFilterModel = useGraph((s) => s.setFilterModel);
  const setFilterTag = useGraph((s) => s.setFilterTag);
  const selectNode = useGraph((s) => s.selectNode);
  const allModels = useGraph((s) => s.allModels());
  const allTags = useGraph((s) => s.allTags());

  const filtered = useMemo(() => {
    let list = nodes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.includes(q))
      );
    }
    if (filterModel) list = list.filter((n) => n.model === filterModel);
    if (filterTag) list = list.filter((n) => n.tags.includes(filterTag));
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [nodes, searchQuery, filterModel, filterTag]);

  return (
    <aside className="sidebar">
      <div className="sidebar-search">
        <svg viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
        </svg>
        <input
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearch("")}>✕</button>
        )}
      </div>

      {(allModels.length > 1 || allTags.length > 0) && (
        <div className="sidebar-filters">
          <div className="filter-row">
            {allModels.map((m) => {
              const kind = inferModelColor(m);
              const dot = MODEL_DOT[kind] ?? MODEL_DOT.other;
              const active = filterModel === m;
              return (
                <button
                  key={m}
                  className={`filter-chip ${active ? "active" : ""}`}
                  style={{ "--dot": dot } as React.CSSProperties}
                  onClick={() => setFilterModel(active ? null : m)}
                >
                  <span className="filter-dot" />
                  {m.split(" ")[0]}
                </button>
              );
            })}
          </div>
          {allTags.length > 0 && (
            <div className="filter-row filter-row--tags">
              {allTags.slice(0, 8).map((t) => (
                <button
                  key={t}
                  className={`filter-chip filter-chip--tag ${filterTag === t ? "active" : ""}`}
                  onClick={() => setFilterTag(filterTag === t ? null : t)}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="sidebar-list">
        {filtered.length === 0 && (
          <div className="sidebar-empty">No nodes found</div>
        )}
        {filtered.map((node) => {
          const kind = inferModelColor(node.model);
          const dot = MODEL_DOT[kind] ?? MODEL_DOT.other;
          return (
            <button
              key={node.id}
              className={`node-item ${selectedId === node.id ? "selected" : ""}`}
              onClick={() => selectNode(node.id)}
            >
              <span className="node-item-dot" style={{ background: dot }} />
              <span className="node-item-text">
                <span className="node-item-title">{node.title}</span>
                <span className="node-item-meta">
                  {node.date}
                  {node.tags.length > 0 && (
                    <> · {node.tags[0]}{node.tags.length > 1 ? ` +${node.tags.length - 1}` : ""}</>
                  )}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        <span>{nodes.length} nodes · {allModels.length} models</span>
      </div>
    </aside>
  );
}
