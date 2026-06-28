import { useGraph } from "../store/useGraph";
import "./TitleBar.css";

export default function TitleBar() {
  const setShowImport = useGraph((s) => s.setShowImport);
  const setShowAdd = useGraph((s) => s.setShowAdd);
  const nodes = useGraph((s) => s.nodes);

  return (
    <header className="titlebar" data-tauri-drag-region>
      <div className="titlebar-brand" data-tauri-drag-region>
        <svg className="titlebar-logo" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.9"/>
          <circle cx="4"  cy="7"  r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="20" cy="7"  r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="4"  cy="17" r="2" fill="currentColor" opacity="0.6"/>
          <circle cx="20" cy="17" r="2" fill="currentColor" opacity="0.6"/>
          <line x1="12" y1="12" x2="4"  y2="7"  stroke="currentColor" strokeWidth="1" opacity="0.4"/>
          <line x1="12" y1="12" x2="20" y2="7"  stroke="currentColor" strokeWidth="1" opacity="0.4"/>
          <line x1="12" y1="12" x2="4"  y2="17" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
          <line x1="12" y1="12" x2="20" y2="17" stroke="currentColor" strokeWidth="1" opacity="0.4"/>
        </svg>
        <span className="titlebar-name">Aiwell</span>
        <span className="titlebar-count">{nodes.length} nodes</span>
      </div>

      <div className="titlebar-actions" data-tauri-drag-region>
        <button
          className="tb-btn"
          title="Import node (Ctrl+I)"
          onClick={() => setShowImport(true)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z"/>
            <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
          </svg>
          Import
        </button>

        <button
          className="tb-btn tb-btn--primary"
          title="Add node (Ctrl+N)"
          onClick={() => setShowAdd(true)}
        >
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
          </svg>
          Add Node
        </button>
      </div>

      <div className="titlebar-controls">
        <button className="wm-btn wm-min" title="Minimize" onClick={() => {}}>─</button>
        <button className="wm-btn wm-max" title="Maximize" onClick={() => {}}>□</button>
        <button className="wm-btn wm-close" title="Close" onClick={() => {}}>✕</button>
      </div>
    </header>
  );
}
