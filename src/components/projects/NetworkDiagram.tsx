"use client";

import { useReducedMotion } from "motion/react";
import type { Diagram, DiagramNode } from "@/content/projects";

const color: Record<DiagramNode["kind"], string> = {
  cloud: "#a78bfa", router: "#3ee6ff", switch: "#4f8cff", firewall: "#f87171", server: "#fbbf24",
  ap: "#34d399", endpoint: "#cfdbf2", panel: "#7ef3ff", db: "#a78bfa", device: "#34d399",
};

/** Interactive-feeling SVG topology with animated packets (static when reduced motion is on). */
export function NetworkDiagram({ diagram }: { diagram: Diagram }) {
  const reduce = useReducedMotion();
  const byId = Object.fromEntries(diagram.nodes.map((n) => [n.id, n]));
  const maxX = Math.max(...diagram.nodes.map((n) => n.x)) + 70;
  const maxY = Math.max(...diagram.nodes.map((n) => n.y)) + 40;
  return (
    <figure className="glass overflow-hidden p-4">
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${maxX} ${maxY}`} className="min-w-[520px] w-full" role="img" aria-label={diagram.caption}>
          {diagram.links.map(([a, b], i) => {
            const A = byId[a], B = byId[b];
            const d = `M${A.x} ${A.y} L${B.x} ${B.y}`;
            return (
              <g key={i}>
                <path d={d} stroke="#3ee6ff" strokeOpacity=".25" strokeWidth="2" fill="none" />
                {!reduce && (
                  <circle r="3.5" fill="#7ef3ff">
                    <animateMotion dur={`${2.4 + (i % 3) * 0.6}s`} repeatCount="indefinite" path={d} begin={`${i * 0.3}s`} />
                  </circle>
                )}
              </g>
            );
          })}
          {diagram.nodes.map((n) => (
            <g key={n.id} className="[&:hover_rect]:stroke-[3]">
              <rect x={n.x - 52} y={n.y - 16} width="104" height="32" rx="8" fill="#0a1630" stroke={color[n.kind]} strokeWidth="1.5" />
              <text x={n.x} y={n.y + 4} textAnchor="middle" fill="#e8eefc" fontSize="11" fontFamily="JetBrains Mono Variable, monospace">{n.label}</text>
            </g>
          ))}
        </svg>
      </div>
      <figcaption className="mt-3 font-mono text-[11px] text-mist-400">{diagram.caption}</figcaption>
    </figure>
  );
}
