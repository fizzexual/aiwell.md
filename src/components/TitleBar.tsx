import { useGraph } from "../store/useGraph";
import "./TitleBar.css";

export default function TitleBar() {
  const setShowImport = useGraph((s) => s.setShowImport);
  const setShowAdd   = useGraph((s) => s.setShowAdd);
  const nodes        = useGraph((s) => s.nodes);
  const theme        = useGraph((s) => s.theme);
  const toggleTheme  = useGraph((s) => s.toggleTheme);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <div className="traffic">
        <button className="tl tl-red"    aria-label="Close" />
        <button className="tl tl-yellow" aria-label="Minimize" />
        <button className="tl tl-green"  aria-label="Maximize" />
      </div>

      <div className="titlebar-mark" data-tauri-drag-region>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3" fill="currentColor"/>
          <circle cx="4"  cy="7"  r="2" fill="currentColor" opacity="0.55"/>
          <circle cx="20" cy="7"  r="2" fill="currentColor" opacity="0.55"/>
          <circle cx="4"  cy="17" r="2" fill="currentColor" opacity="0.55"/>
          <circle cx="20" cy="17" r="2" fill="currentColor" opacity="0.55"/>
          <line x1="12" y1="12" x2="4"  y2="7"  stroke="currentColor" strokeWidth="1.2" opacity="0.35"/>
          <line x1="12" y1="12" x2="20" y2="7"  stroke="currentColor" strokeWidth="1.2" opacity="0.35"/>
          <line x1="12" y1="12" x2="4"  y2="17" stroke="currentColor" strokeWidth="1.2" opacity="0.35"/>
          <line x1="12" y1="12" x2="20" y2="17" stroke="currentColor" strokeWidth="1.2" opacity="0.35"/>
        </svg>
        Aiwell
        <span className="titlebar-count">{nodes.length} nodes</span>
      </div>

      <div className="titlebar-spacer" data-tauri-drag-region />

      {/* import */}
      <button
        className="titlebar-btn"
        title="Import node (Ctrl+I)"
        onClick={() => setShowImport(true)}
      >
        <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 3a1 1 0 011 1v9.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 13.586V4a1 1 0 011-1z"/>
          <path d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
        </svg>
      </button>

      {/* theme toggle */}
      <button
        className="titlebar-btn"
        title={theme === "dark" ? "Switch to light" : "Switch to dark"}
        onClick={toggleTheme}
      >
        {theme === "dark" ? (
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd"/>
          </svg>
        ) : (
          <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
          </svg>
        )}
      </button>

      {/* add node */}
      <button
        className="titlebar-add"
        title="Add node (Ctrl+N)"
        onClick={() => setShowAdd(true)}
      >
        <svg width="13" height="13" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
        </svg>
        New node
      </button>
    </div>
  );
}
