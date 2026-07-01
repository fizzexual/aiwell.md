import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SEED_NODES } from "../data/seed";
import { parseWikilinks, slugify } from "../lib/parser";

export interface AiwellNode {
  id: string;
  title: string;
  content: string;
  model: string;
  date: string;
  tags: string[];
  links: string[];
}

interface GraphState {
  nodes: AiwellNode[];
  selectedId: string | null;
  searchQuery: string;
  filterModel: string | null;
  filterTag: string | null;
  showImport: boolean;
  showAdd: boolean;
  toasts: { id: string; msg: string }[];
  theme: "light" | "dark";

  addNode: (node: Omit<AiwellNode, "id">) => string;
  updateNode: (id: string, updates: Partial<AiwellNode>) => void;
  deleteNode: (id: string) => void;
  selectNode: (id: string | null) => void;
  setSearch: (q: string) => void;
  setFilterModel: (m: string | null) => void;
  setFilterTag: (t: string | null) => void;
  setShowImport: (v: boolean) => void;
  setShowAdd: (v: boolean) => void;
  toast: (msg: string) => void;
  dismissToast: (id: string) => void;
  toggleTheme: () => void;
}

export const useGraph = create<GraphState>()(
  persist(
    (set) => ({
      nodes: SEED_NODES,
      selectedId: "what-is-aiwell",
      searchQuery: "",
      filterModel: null,
      filterTag: null,
      showImport: false,
      showAdd: false,
      toasts: [],
      theme: "light" as const,

      addNode: (node) => {
        const id = slugify(node.title) || `node-${Date.now()}`;
        const links = parseWikilinks(node.content);
        const newNode: AiwellNode = { ...node, id, links };
        set((s) => ({ nodes: [...s.nodes, newNode], selectedId: id }));
        return id;
      },

      updateNode: (id, updates) => {
        set((s) => ({
          nodes: s.nodes.map((n) => {
            if (n.id !== id) return n;
            const next = { ...n, ...updates };
            next.links = parseWikilinks(next.content);
            return next;
          }),
        }));
      },

      deleteNode: (id) => {
        set((s) => ({
          nodes: s.nodes.filter((n) => n.id !== id),
          selectedId: s.selectedId === id ? null : s.selectedId,
        }));
      },

      selectNode: (id) => set({ selectedId: id }),
      setSearch: (searchQuery) => set({ searchQuery }),
      setFilterModel: (filterModel) => set({ filterModel }),
      setFilterTag: (filterTag) => set({ filterTag }),
      setShowImport: (showImport) => set({ showImport }),
      setShowAdd: (showAdd) => set({ showAdd }),

      toast: (msg) => {
        const id = Math.random().toString(36).slice(2);
        set((s) => ({ toasts: [...s.toasts, { id, msg }] }));
        setTimeout(() => {
          set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
        }, 3000);
      },

      dismissToast: (id) =>
        set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

      toggleTheme: () =>
        set((s) => ({ theme: s.theme === "light" ? "dark" : "light" })),
    }),
    {
      name: "aiwell.graph.v1",
      partialize: (s) => ({
        nodes: s.nodes,
        selectedId: s.selectedId,
        theme: s.theme,
      }),
    }
  )
);
