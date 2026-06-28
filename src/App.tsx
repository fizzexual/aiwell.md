import { useEffect } from "react";
import { useGraph } from "./store/useGraph";
import TitleBar from "./components/TitleBar";
import Sidebar from "./components/Sidebar";
import KnowledgeGraph from "./components/KnowledgeGraph";
import NodePanel from "./components/NodePanel";
import ImportModal from "./components/ImportModal";
import AddNodeModal from "./components/AddNodeModal";
import Toaster from "./components/Toaster";
import "./App.css";

export default function App() {
  const showImport = useGraph((s) => s.showImport);
  const showAdd = useGraph((s) => s.showAdd);
  const setShowImport = useGraph((s) => s.setShowImport);
  const setShowAdd = useGraph((s) => s.setShowAdd);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key === "i") { e.preventDefault(); setShowImport(true); }
      if (mod && e.key === "n") { e.preventDefault(); setShowAdd(true); }
      if (e.key === "Escape") {
        setShowImport(false);
        setShowAdd(false);
      }
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
      {showImport && <ImportModal />}
      {showAdd && <AddNodeModal />}
      <Toaster />
    </div>
  );
}
