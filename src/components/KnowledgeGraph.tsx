import { useEffect, useRef, useCallback } from "react";
import * as d3force from "d3-force";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { drag } from "d3-drag";
import { useGraph } from "../store/useGraph";
import { inferModelColor } from "../lib/parser";
import "./KnowledgeGraph.css";

const MODEL_VAR: Record<string, string> = {
  claude: "--model-claude",
  gpt:    "--model-gpt",
  gemini: "--model-gemini",
  manual: "--model-manual",
  other:  "--model-other",
};

function modelColor(model: string): string {
  const k = inferModelColor(model);
  return `var(${MODEL_VAR[k] ?? MODEL_VAR.other})`;
}

interface SimNode extends d3force.SimulationNodeDatum {
  id: string;
  title: string;
  model: string;
  deg: number;
}
interface SimLink extends d3force.SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
}

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const posRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const nodes      = useGraph((s) => s.nodes);
  const selectNode = useGraph((s) => s.selectNode);
  const setShowAdd = useGraph((s) => s.setShowAdd);

  const build = useCallback(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    const svg = select(svgEl);
    svg.selectAll("*").remove();

    const raw    = svgEl.getBoundingClientRect();
    const width  = raw.width  || 900;
    const height = raw.height || 700;

    const g = svg.append("g").attr("class", "graph-root");

    const zoomBeh = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 4])
      .on("zoom", (e) => g.attr("transform", e.transform));
    svg.call(zoomBeh).on("dblclick.zoom", null);
    svg.on("dblclick", () => setShowAdd(true));

    // degree map
    const degMap = new Map<string, number>();
    nodes.forEach((n) => {
      degMap.set(n.id, (degMap.get(n.id) ?? 0));
      n.links.forEach((lid) => degMap.set(lid, (degMap.get(lid) ?? 0) + 1));
    });
    nodes.forEach((n) => degMap.set(n.id, (degMap.get(n.id) ?? 0) + n.links.length));

    const simNodes: SimNode[] = nodes.map((n) => {
      const saved = posRef.current.get(n.id);
      return { id: n.id, title: n.title, model: n.model, deg: degMap.get(n.id) ?? 0, x: saved?.x, y: saved?.y };
    });

    const nodeById = new Map(simNodes.map((n) => [n.id, n]));
    const simLinks: SimLink[] = [];
    const seen = new Set<string>();
    nodes.forEach((n) => {
      n.links.forEach((lid) => {
        const key = [n.id, lid].sort().join("--");
        if (!seen.has(key) && nodeById.has(lid)) {
          seen.add(key);
          simLinks.push({ source: nodeById.get(n.id)!, target: nodeById.get(lid)! });
        }
      });
    });

    const sim = d3force.forceSimulation<SimNode, SimLink>(simNodes)
      .force("link",    d3force.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(120).strength(0.55))
      .force("charge",  d3force.forceManyBody().strength(-260))
      .force("center",  d3force.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3force.forceCollide(32));

    // edges
    const edgeG = g.append("g");
    const edge = edgeG.selectAll<SVGLineElement, SimLink>("line")
      .data(simLinks)
      .join("line")
      .attr("class", "graph-edge intro")
      .style("--intro-delay" as never, (_, i) => `${i * 8}ms`);

    // nodes
    const nodeG = g.append("g");
    const nodeEl = nodeG.selectAll<SVGGElement, SimNode>("g")
      .data(simNodes, (d) => d.id)
      .join("g")
      .attr("class", (d) => `graph-node intro${useGraph.getState().selectedId === d.id ? " selected" : ""}`)
      .style("--intro-delay" as never, (_, i) => `${i * 12}ms`)
      .attr("data-id", (d) => d.id)
      .call(
        drag<SVGGElement, SimNode>()
          .on("start", (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end",   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on("click", (_, d) => selectNode(d.id));

    nodeEl.append("circle")
      .attr("class", "ring")
      .attr("r", 18);

    nodeEl.append("circle")
      .attr("class", "dot")
      .attr("r", (d) => 7 + Math.min(d.deg * 1.5, 6))
      .attr("fill", (d) => modelColor(d.model));

    nodeEl.append("text")
      .attr("dy", (d) => 7 + Math.min(d.deg * 1.5, 6) + 12)
      .attr("text-anchor", "middle")
      .text((d) => d.title.length > 20 ? d.title.slice(0, 19) + "…" : d.title);

    const syncSelected = (selId: string | null) => {
      nodeEl.classed("selected", (d) => d.id === selId);
    };
    syncSelected(useGraph.getState().selectedId);

    sim.on("tick", () => {
      edge
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);
      nodeEl.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      simNodes.forEach((n) => { if (n.x != null && n.y != null) posRef.current.set(n.id, { x: n.x, y: n.y }); });
    });

    const unsub = useGraph.subscribe((s) => syncSelected(s.selectedId));
    return () => { unsub(); sim.stop(); };
  }, [nodes, selectNode, setShowAdd]);

  useEffect(() => {
    const cleanup = build();
    return cleanup;
  }, [build]);

  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => build());
    ro.observe(el);
    return () => ro.disconnect();
  }, [build]);

  // unique models for legend
  const models = [...new Set(nodes.map((n) => n.model))];

  return (
    <div className="map">
      <div className="map-header">
        <span className="map-title">
          Knowledge Graph
          <span className="map-subtitle">{nodes.length} nodes · {models.length} model{models.length !== 1 ? "s" : ""}</span>
        </span>
      </div>
      <div className="map-canvas">
        <svg ref={svgRef} className="graph-svg" />
        {models.length > 1 && (
          <div className="graph-legend">
            {models.map((m) => (
              <div key={m} className="legend-row">
                <span className="legend-dot" style={{ background: `var(${MODEL_VAR[inferModelColor(m)] ?? MODEL_VAR.other})` }} />
                <span className="legend-name">{m}</span>
              </div>
            ))}
          </div>
        )}
        <div className="graph-hint">double-click to add · drag · scroll to zoom</div>
      </div>
    </div>
  );
}
