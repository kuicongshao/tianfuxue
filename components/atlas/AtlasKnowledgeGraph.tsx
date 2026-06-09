"use client";

import { useEffect, useRef } from "react";
import type { AtlasObject } from "@/components/atlas/types";

export function AtlasKnowledgeGraph({ object }: { object?: AtlasObject | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let network: { destroy: () => void } | null = null;
    async function render() {
      if (!ref.current || !object?.graph) return;
      const { Network } = await import("vis-network/standalone");
      const nodes = object.graph.nodes.map((label, index) => ({ id: label, label, color: index === 0 ? "#44d4ff" : "#18233f", font: { color: "#eef4ff" } }));
      const edges = object.graph.edges.map(([from, to, label]) => ({ from, to, label, color: "#8f6bff", font: { color: "#cbd5e1", size: 10 } }));
      network = new Network(ref.current, { nodes, edges }, { physics: { stabilization: true }, interaction: { hover: true }, nodes: { shape: "dot", size: 18 } });
    }
    render();
    return () => network?.destroy();
  }, [object]);

  return <div ref={ref} className="h-56 rounded-md border border-white/10 bg-slate-950/60" />;
}
