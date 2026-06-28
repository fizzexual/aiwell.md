import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3-force";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { drag } from "d3-drag";
import { useGraph } from "../store/useGraph";
import { inferModelColor } from "../lib/parser";
import "./KnowledgeGraph.css";

const MODEL_COLOR: Record<string, string> = {
  claude: "#7c3aed",
  gpt: "#10b981",
  gemini: "#3b82f6",
  manual: "#06b6d4",
  other: "#f59e0b",
};

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  model: string;
  tags: string[];
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
}

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const simRef = useRef<d3.Simulation<SimNode, SimLink> | null>(null);
  const posRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const nodes = useGraph((s) => s.nodes);
  const selectedId = useGraph((s) => s.selectedId);
  const selectNode = useGraph((s) => s.selectNode);
  const setShowAdd = useGraph((s) => s.setShowAdd);

  const buildGraph = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const { width, height } = svgEl.getBoundingClientRect();
    if (!width || !height) return;

    const svg = select(svgEl);
    svg.selectAll("*").remove();

    // defs: glow filters
    const defs = svg.append("defs");
    Object.entries(MODEL_COLOR).forEach(([kind]) => {
      const filter = defs.append("filter").attr("id", `glow-${kind}`);
      filter.append("feGaussianBlur").attr("stdDeviation", "4").attr("result", "blur");
      const merge = filter.append("feMerge");
      merge.append("feMergeNode").attr("in", "blur");
      merge.append("feMergeNode").attr("in", "SourceGraphic");
    });

    const g = svg.append("g").attr("class", "graph-root");

    // Zoom
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoomBehavior);
    svg.on("dblclick.zoom", null);

    svg.on("dblclick", () => setShowAdd(true));

    // Build sim nodes/links
    const simNodes: SimNode[] = nodes.map((n) => {
      const saved = posRef.current.get(n.id);
      return { id: n.id, title: n.title, model: n.model, tags: n.tags, x: saved?.x, y: saved?.y };
    });

    const nodeById = new Map(simNodes.map((n) => [n.id, n]));
    const simLinks: SimLink[] = [];
    const seen = new Set<string>();
    nodes.forEach((n) => {
      n.links.forEach((targetId) => {
        const key = [n.id, targetId].sort().join("--");
        if (!seen.has(key) && nodeById.has(targetId)) {
          seen.add(key);
          simLinks.push({
            source: nodeById.get(n.id)!,
            target: nodeById.get(targetId)!,
          });
        }
      });
    });

    // Simulation
    const sim = d3.forceSimulation<SimNode, SimLink>(simNodes)
      .force("link", d3.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(130).strength(0.6))
      .force("charge", d3.forceManyBody().strength(-280))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3.forceCollide(38));

    simRef.current = sim;

    // Draw links
    const linkG = g.append("g").attr("class", "links");
    const link = linkG.selectAll<SVGLineElement, SimLink>("line")
      .data(simLinks)
      .join("line")
      .attr("class", "graph-link");

    // Draw nodes
    const nodeG = g.append("g").attr("class", "nodes");
    const nodeEl = nodeG.selectAll<SVGGElement, SimNode>("g")
      .data(simNodes, (d) => d.id)
      .join("g")
      .attr("class", "graph-node")
      .attr("data-id", (d) => d.id)
      .style("cursor", "pointer")
      .call(
        drag<SVGGElement, SimNode>()
          .on("start", (e, d) => {
            if (!e.active) sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag", (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end", (e, d) => {
            if (!e.active) sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      )
      .on("click", (_, d) => selectNode(d.id));

    // Ring (outer glow ring for selected)
    nodeEl.append("circle")
      .attr("class", "node-ring")
      .attr("r", 22);

    // Main circle
    nodeEl.append("circle")
      .attr("class", "node-body")
      .attr("r", 16)
      .attr("fill", (d) => {
        const kind = inferModelColor(d.model);
        return MODEL_COLOR[kind] ?? MODEL_COLOR.other;
      })
      .attr("filter", (d) => {
        const kind = inferModelColor(d.model);
        return `url(#glow-${kind})`;
      });

    // Label
    nodeEl.append("text")
      .attr("class", "node-label")
      .attr("dy", 28)
      .text((d) => d.title.length > 18 ? d.title.slice(0, 17) + "…" : d.title);

    // Highlight selected
    const highlight = () => {
      nodeEl.select("circle.node-ring")
        .attr("r", (d) => (d.id === selectedId ? 22 : 0))
        .attr("fill", (d) => {
          const kind = inferModelColor(d.model);
          return MODEL_COLOR[kind] ?? MODEL_COLOR.other;
        })
        .attr("opacity", 0.22);

      nodeEl.select("circle.node-body")
        .attr("stroke", (d) => (d.id === selectedId ? "#fff" : "none"))
        .attr("stroke-width", (d) => (d.id === selectedId ? 2 : 0));
    };
    highlight();

    sim.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);

      nodeEl.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);

      simNodes.forEach((n) => {
        if (n.x != null && n.y != null) posRef.current.set(n.id, { x: n.x, y: n.y });
      });
    });

    // Re-run highlight whenever selectedId changes
    const unsub = useGraph.subscribe((state) => {
      nodeEl.select("circle.node-ring")
        .attr("r", (d) => (d.id === state.selectedId ? 22 : 0))
        .attr("opacity", 0.22);
      nodeEl.select("circle.node-body")
        .attr("stroke", (d) => (d.id === state.selectedId ? "#fff" : "none"))
        .attr("stroke-width", (d) => (d.id === state.selectedId ? 2 : 0));
    });

    return () => {
      unsub();
      sim.stop();
    };
  }, [nodes, selectedId, selectNode, setShowAdd]);

  useEffect(() => {
    const cleanup = buildGraph();
    return cleanup;
  }, [buildGraph]);

  // Resize observer
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => buildGraph());
    ro.observe(el);
    return () => ro.disconnect();
  }, [buildGraph]);

  return (
    <div className="graph-wrap">
      <svg ref={svgRef} className="graph-svg" />
      <div className="graph-hint">double-click canvas to add · drag to move · scroll to zoom</div>
    </div>
  );
}
