import { useEffect } from "react";
import { useGraph } from "./store/useGraph";
import { loadAllNodes, watchNodes, seedToDisk, isTauri } from "./lib/fileStore";
import { SEED_NODES } from "./data/seed";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import KnowledgeGraph from "./components/KnowledgeGraph";
import NodePanel from "./components/NodePanel";
import ImportModal from "./components/ImportModal";
import AddNodeModal from "./components/AddNodeModal";
import NodeModal from "./components/NodeModal";
import Toaster from "./components/Toaster";
import "./App.css";

export default function App() {
  const showImport       = useGraph((s) => s.showImport);
  const showAdd          = useGraph((s) => s.showAdd);
  const showNodeModal    = useGraph((s) => s.showNodeModal);
  const theme            = useGraph((s) => s.theme);
  const setShowImport    = useGraph((s) => s.setShowImport);
  const setShowAdd       = useGraph((s) => s.setShowAdd);
  const setShowNodeModal = useGraph((s) => s.setShowNodeModal);

  // sync theme to html data-theme
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // load nodes from ~/.aiwell/nodes/ on startup; watch for external writes
  useEffect(() => {
    if (!isTauri()) return;
    let unwatch: (() => void) | undefined;

    loadAllNodes().then(async (loaded) => {
      if (loaded.length > 0) {
        useGraph.getState().initNodes(loaded);
      } else {
        // first run — seed the vault onto disk
        await seedToDisk(SEED_NODES);
        useGraph.getState().initNodes(SEED_NODES);
      }
      unwatch = await watchNodes((nodes) => {
        useGraph.getState().initNodes(nodes);
      });
    });

    return () => { unwatch?.(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "i") { e.preventDefault(); setShowImport(true); }
      if (mod && e.key === "n") { e.preventDefault(); setShowAdd(true); }
      if (e.key === "Escape")   { setShowImport(false); setShowAdd(false); setShowNodeModal(false); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setShowImport, setShowAdd]);

  return (
    <div className="app">
      <TitleBar />
      <div className="app-body">
        <Sidebar />
        <KnowledgeGraph />
        <NodePanel />
      </div>
      {showImport    && <ImportModal />}
      {showAdd       && <AddNodeModal />}
      {showNodeModal && <NodeModal />}
      <Toaster />
    </div>
  );
}
