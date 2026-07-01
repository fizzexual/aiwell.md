import { useEffect, useRef, useCallback } from "react";
import * as d3force from "d3-force";
import { select } from "d3-selection";
import { zoom } from "d3-zoom";
import { drag } from "d3-drag";
import { useGraph } from "../store/useGraph";
import type { AiwellNode } from "../store/useGraph";
import "./KnowledgeGraph.css";

function nodeColorVar(deg: number): string {
  if (deg <= 1) return "var(--node-2)";
  if (deg <= 3) return "var(--node-3)";
  if (deg <= 5) return "var(--node-4)";
  return "var(--node-5)";
}

function dotR(deg: number): number {
  return 6 + Math.min(deg * 1.8, 8);
}

interface SimNode extends d3force.SimulationNodeDatum {
  id: string;
  title: string;
  deg: number;
}
interface SimLink extends d3force.SimulationLinkDatum<SimNode> {
  source: SimNode;
  target: SimNode;
}

function buildNeighbors(nodes: AiwellNode[], selId: string): Set<string> {
  const sel = nodes.find((n) => n.id === selId);
  const set = new Set<string>([selId]);
  if (!sel) return set;
  sel.links.forEach((lid) => set.add(lid));
  nodes.forEach((n) => { if (n.links.includes(selId)) set.add(n.id); });
  return set;
}

export default function KnowledgeGraph() {
  const svgRef = useRef<SVGSVGElement>(null);
  const posRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  const nodes           = useGraph((s) => s.nodes);
  const selectNode      = useGraph((s) => s.selectNode);
  const setShowAdd      = useGraph((s) => s.setShowAdd);
  const setShowNodeModal = useGraph((s) => s.setShowNodeModal);

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

    // canvas double-click → add node; canvas click → deselect
    svg.on("dblclick", (e) => {
      if ((e.target as SVGElement).closest(".graph-node")) return;
      setShowAdd(true);
    });
    svg.on("click", (e) => {
      if ((e.target as SVGElement).closest(".graph-node")) return;
      selectNode(null);
    });

    // degree map
    const degMap = new Map<string, number>();
    nodes.forEach((n) => {
      degMap.set(n.id, (degMap.get(n.id) ?? 0));
      n.links.forEach((lid) => degMap.set(lid, (degMap.get(lid) ?? 0) + 1));
    });
    nodes.forEach((n) => degMap.set(n.id, (degMap.get(n.id) ?? 0) + n.links.length));

    const simNodes: SimNode[] = nodes.map((n) => {
      const saved = posRef.current.get(n.id);
      return { id: n.id, title: n.title, deg: degMap.get(n.id) ?? 0, x: saved?.x, y: saved?.y };
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
      .force("link",    d3force.forceLink<SimNode, SimLink>(simLinks).id((d) => d.id).distance(130).strength(0.5))
      .force("charge",  d3force.forceManyBody().strength(-300))
      .force("center",  d3force.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3force.forceCollide((d) => dotR(d.deg) + 18));

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
      .on("click", (e, d) => { e.stopPropagation(); selectNode(d.id); })
      .on("dblclick", (e, d) => {
        e.stopPropagation();
        selectNode(d.id);
        setShowNodeModal(true);
      });

    // ring drawn first (behind dot)
    nodeEl.append("circle")
      .attr("class", "ring")
      .attr("r", (d) => dotR(d.deg) + 5);

    nodeEl.append("circle")
      .attr("class", "dot")
      .attr("r", (d) => dotR(d.deg))
      .attr("fill", (d) => nodeColorVar(d.deg));

    nodeEl.append("text")
      .attr("dy", (d) => dotR(d.deg) + 13)
      .attr("text-anchor", "middle")
      .text((d) => d.title.length > 22 ? d.title.slice(0, 21) + "…" : d.title);

    // ---- connection highlighting ----
    const applyHighlight = (selId: string | null) => {
      nodeEl.classed("selected", (d) => d.id === selId);

      if (!selId) {
        nodeEl.classed("faded connected", false);
        nodeEl.select<SVGCircleElement>("circle.dot")
          .attr("fill", (d) => nodeColorVar(d.deg));
        edge.classed("lit faded", false);
        return;
      }

      const neighbors = buildNeighbors(nodes, selId);

      nodeEl.classed("faded",     (d) => !neighbors.has(d.id));
      nodeEl.classed("connected", (d) => d.id !== selId && neighbors.has(d.id));

      nodeEl.select<SVGCircleElement>("circle.dot")
        .attr("fill", (d) => {
          if (d.id === selId)       return "var(--accent)";
          if (neighbors.has(d.id)) return "var(--accent-connected)";
          return nodeColorVar(d.deg);
        });

      edge
        .classed("lit",   (d) => (d.source as SimNode).id === selId || (d.target as SimNode).id === selId)
        .classed("faded", (d) => (d.source as SimNode).id !== selId && (d.target as SimNode).id !== selId);
    };

    applyHighlight(useGraph.getState().selectedId);

    sim.on("tick", () => {
      edge
        .attr("x1", (d) => (d.source as SimNode).x ?? 0)
        .attr("y1", (d) => (d.source as SimNode).y ?? 0)
        .attr("x2", (d) => (d.target as SimNode).x ?? 0)
        .attr("y2", (d) => (d.target as SimNode).y ?? 0);
      nodeEl.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      simNodes.forEach((n) => { if (n.x != null && n.y != null) posRef.current.set(n.id, { x: n.x, y: n.y }); });
    });

    const unsub = useGraph.subscribe((s) => applyHighlight(s.selectedId));
    return () => { unsub(); sim.stop(); };
  }, [nodes, selectNode, setShowAdd, setShowNodeModal]);

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

  return (
    <div className="map">
      <div className="map-header">
        <span className="map-title">
          Knowledge Graph
          <span className="map-subtitle">{nodes.length} node{nodes.length !== 1 ? "s" : ""}</span>
        </span>
      </div>
      <div className="map-canvas">
        <svg ref={svgRef} className="graph-svg" />
        <div className="graph-hint">double-click canvas to add · click node to highlight · double-click to open</div>
      </div>
    </div>
  );
}
