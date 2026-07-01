import { useMemo } from "react";
import { useGraph } from "../store/useGraph";
import { inferModelColor } from "../lib/parser";
import "./Sidebar.css";

const MODEL_CSS_VAR: Record<string, string> = {
  claude: "var(--model-claude)",
  gpt:    "var(--model-gpt)",
  gemini: "var(--model-gemini)",
  manual: "var(--model-manual)",
  other:  "var(--model-other)",
};

export default function Sidebar() {
  const nodes       = useGraph((s) => s.nodes);
  const selectedId  = useGraph((s) => s.selectedId);
  const searchQuery = useGraph((s) => s.searchQuery);
  const filterModel = useGraph((s) => s.filterModel);
  const filterTag   = useGraph((s) => s.filterTag);
  const setSearch      = useGraph((s) => s.setSearch);
  const setFilterModel = useGraph((s) => s.setFilterModel);
  const setFilterTag   = useGraph((s) => s.setFilterTag);
  const selectNode     = useGraph((s) => s.selectNode);
  const setShowAdd     = useGraph((s) => s.setShowAdd);

  const allModels = useMemo(() => [...new Set(nodes.map((n) => n.model))].sort(), [nodes]);
  const allTags   = useMemo(() => [...new Set(nodes.flatMap((n) => n.tags))].sort(), [nodes]);

  const filtered = useMemo(() => {
    let list = nodes;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some((t) => t.includes(q))
      );
    }
    if (filterModel) list = list.filter((n) => n.model === filterModel);
    if (filterTag)   list = list.filter((n) => n.tags.includes(filterTag));
    return [...list].sort((a, b) => b.date.localeCompare(a.date));
  }, [nodes, searchQuery, filterModel, filterTag]);

  return (
    <aside className="sidebar">
      <div className="vault-header">
        <span className="vault-name">Aiwell</span>
        <button
          className="ghost-btn"
          title="Add node (Ctrl+N)"
          onClick={() => setShowAdd(true)}
        >
          <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>

      <div className="sidebar-search">
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd"/>
        </svg>
        <input
          placeholder="Search nodes…"
          value={searchQuery}
          onChange={(e) => setSearch(e.target.value)}
        />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearch("")}>×</button>
        )}
      </div>

      {(allModels.length > 1 || allTags.length > 0) && (
        <div className="sidebar-filters">
          <div className="filter-row">
            {allModels.map((m) => {
              const dot = MODEL_CSS_VAR[inferModelColor(m)] ?? MODEL_CSS_VAR.other;
              const active = filterModel === m;
              return (
                <button
                  key={m}
                  className={`filter-chip${active ? " active" : ""}`}
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
            <div className="filter-row">
              {allTags.slice(0, 8).map((t) => (
                <button
                  key={t}
                  className={`filter-chip filter-chip--tag${filterTag === t ? " active" : ""}`}
                  onClick={() => setFilterTag(filterTag === t ? null : t)}
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="sidebar-divider" />

      <div className="tree-scroll">
        {filtered.length === 0 && (
          <div className="sidebar-empty">No nodes found</div>
        )}
        {filtered.map((node) => {
          const dot = MODEL_CSS_VAR[inferModelColor(node.model)] ?? MODEL_CSS_VAR.other;
          return (
            <button
              key={node.id}
              className={`tree-item${selectedId === node.id ? " active" : ""}`}
              onClick={() => selectNode(node.id)}
            >
              <span className="tree-dot" style={{ background: dot }} />
              <span className="tree-label">{node.title}</span>
              <span className="tree-date">{node.date.slice(5)}</span>
            </button>
          );
        })}
      </div>

      <div className="sidebar-footer">
        {nodes.length} nodes · {allModels.length} model{allModels.length !== 1 ? "s" : ""}
      </div>
    </aside>
  );
}
