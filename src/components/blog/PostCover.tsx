/* eslint-disable @next/next/no-img-element */
import type { PostMeta } from "@/lib/blog";
import { look } from "@/lib/look";

export const coverStyles = ["network", "circuit", "matrix", "radar", "waves", "orbit", "terminal", "shield", "pulse", "grid", "binary", "cloud", "chip", "globe", "signal", "lock"] as const;
export type CoverStyle = (typeof coverStyles)[number];

const hashOf = (s: string) => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };
const PALETTES = [["#14c8f0", "#2f6bff"], ["#8b5cf6", "#14c8f0"], ["#34d399", "#2553d6"], ["#f472b6", "#8b5cf6"], ["#fbbf24", "#f87171"], ["#22ff88", "#0ea2c9"]];

function Art({ style, h }: { style: CoverStyle; h: number }) {
  const S = { stroke: "#cfe9ff", strokeOpacity: 0.45, fill: "none" } as const;
  switch (style) {
    case "circuit":
      return (
        <g {...S} strokeWidth="1.5">
          {Array.from({ length: 9 }).map((_, i) => {
            const y = 25 + i * 18, x1 = 20 + ((h >> i) % 60), x2 = 150 + ((h >> (i + 3)) % 120);
            return <path key={i} className="cv-flow" style={{ animationDelay: `${i * 0.2}s` }} d={`M${x1} ${y} H${x2} l12 ${i % 2 ? 12 : -12} H380`} />;
          })}
          {Array.from({ length: 9 }).map((_, i) => <circle key={i} className="cv-blink" style={{ animationDelay: `${i * 0.25}s` }} cx={150 + ((h >> (i + 3)) % 120)} cy={25 + i * 18} r="3.5" fill="#7ef3ff" fillOpacity=".7" stroke="none" />)}
          <rect x="250" y="70" width="70" height="56" rx="6" fill="#0a1630" strokeOpacity=".7" />
        </g>
      );
    case "matrix":
      return (
        <g fontFamily="JetBrains Mono Variable, monospace" fontSize="12" fill="#22ff88">
          {Array.from({ length: 20 }).map((_, c) => (
            <g key={c} className="cv-fall" style={{ animationDelay: `${((h >> (c % 16)) % 30) / 10}s`, animationDuration: `${2.4 + ((h >> c) % 20) / 10}s` }}>
              {Array.from({ length: 6 }).map((_, r) => <text key={r} x={10 + c * 20} y={r * 14} fillOpacity={1 - r * 0.15}>{((h >> (c + r)) & 1) ? "1" : "0"}</text>)}
            </g>
          ))}
        </g>
      );
    case "radar":
      return (
        <g {...S}>
          {[30, 60, 90].map((r) => <circle key={r} cx="300" cy="100" r={r} strokeOpacity=".25" />)}
          <path d="M210 100 H390 M300 10 V190" strokeOpacity=".2" />
          <g className="cv-spin" style={{ transformOrigin: "300px 100px", transformBox: "view-box" }}>
            <path d="M300 100 L390 100 A90 90 0 0 0 363 36 Z" fill="#7ef3ff" fillOpacity=".18" stroke="none" />
          </g>
          {[[330, 70], [262, 128], [345, 140]].map(([x, y], i) => <circle key={i} className="cv-blink" style={{ animationDelay: `${i * 0.6}s` }} cx={x} cy={y} r="4" fill="#22ff88" stroke="none" />)}
        </g>
      );
    case "waves":
      return (
        <g {...S} strokeWidth="2">
          {Array.from({ length: 5 }).map((_, i) => (
            <path key={i} className="cv-drift" style={{ animationDelay: `${i * 0.5}s` }} strokeOpacity={0.6 - i * 0.1}
              d={`M-20 ${80 + i * 18} C 60 ${50 + i * 18}, 120 ${110 + i * 18}, 200 ${80 + i * 18} S 340 ${50 + i * 18}, 420 ${80 + i * 18}`} />
          ))}
        </g>
      );
    case "orbit":
      return (
        <g {...S}>
          <circle cx="300" cy="100" r="16" fill="#0a1630" />
          {[40, 65, 90].map((r, i) => (
            <g key={r}>
              <circle cx="300" cy="100" r={r} strokeOpacity=".25" strokeDasharray="3 5" />
              <g className="cv-spin" style={{ transformOrigin: "300px 100px", transformBox: "view-box", animationDuration: `${6 + i * 4}s` }}>
                <circle cx={300 + r} cy="100" r="5" fill="#7ef3ff" fillOpacity=".8" stroke="none" />
              </g>
            </g>
          ))}
        </g>
      );
    case "terminal":
      return (
        <g {...S}>
          <rect x="190" y="30" width="190" height="130" rx="8" fill="#0a1630" strokeOpacity=".6" />
          <path d="M190 50 H380" strokeOpacity=".4" />
          {[202, 212, 222].map((x) => <circle key={x} cx={x} cy="40" r="3" />)}
          <path d="M205 72 l10 7 l-10 7" strokeWidth="2" stroke="#22ff88" strokeOpacity=".8" />
          <path className="cv-type" d="M222 79 h110 M205 102 h80 M205 122 h140 M205 142 h60" strokeWidth="2" />
        </g>
      );
    case "shield":
      return (
        <g {...S}>
          <path d="M300 30 L345 48 V95 C345 128 323 148 300 160 C277 148 255 128 255 95 V48 Z" fill="#0a1630" strokeOpacity=".7" />
          <path className="cv-draw" d="M282 96 L296 110 L320 84" strokeWidth="3" stroke="#22ff88" strokeOpacity=".9" />
          {[60, 90].map((r, i) => <circle key={r} className="cv-pulse" style={{ animationDelay: `${i * 0.6}s` }} cx="300" cy="95" r={r} strokeOpacity=".3" />)}
        </g>
      );
    case "pulse":
      return (
        <g {...S} strokeWidth="2">
          <path className="cv-draw" stroke="#22ff88" strokeOpacity=".9" d="M10 110 H120 L140 70 L160 150 L180 40 L200 170 L220 110 H390" />
          {[0, 1, 2].map((i) => <circle key={i} className="cv-pulse" style={{ animationDelay: `${i * 0.5}s` }} cx="300" cy="100" r={30 + i * 22} strokeOpacity=".25" />)}
        </g>
      );
    case "grid":
      return (
        <g {...S} strokeOpacity=".3">
          {Array.from({ length: 11 }).map((_, i) => <path key={`v${i}`} d={`M${200 + (i - 5) * 18} 90 L${200 + (i - 5) * 70} 200`} />)}
          {Array.from({ length: 6 }).map((_, i) => <path key={`h${i}`} className="cv-blink" style={{ animationDelay: `${i * 0.2}s` }} d={`M${110 - i * 20} ${100 + i * i * 4 + i * 8} H${290 + i * 20}`} />)}
          <circle cx="200" cy="70" r="26" fill="#f472b6" fillOpacity=".25" stroke="#f472b6" strokeOpacity=".6" className="cv-blink" />
        </g>
      );
    case "binary":
      return (
        <g fontFamily="JetBrains Mono Variable, monospace" fontSize="14" fill="#7ef3ff">
          {Array.from({ length: 6 }).map((_, r) => (
            <text key={r} className="cv-drift" style={{ animationDelay: `${r * 0.4}s` }} x={20} y={30 + r * 26} fillOpacity={0.25 + (r % 3) * 0.2}>
              {Array.from({ length: 28 }).map((_, c) => ((h >> ((r + c) % 24)) & 1 ? "1" : "0")).join(" ")}
            </text>
          ))}
        </g>
      );
    case "cloud":
      return (
        <g {...S}>
          <path d="M240 120 a30 30 0 0 1 8 -58 a40 40 0 0 1 75 -8 a30 30 0 0 1 20 66 Z" fill="#0a1630" strokeOpacity=".7" />
          {[260, 290, 320].map((x, i) => <path key={x} className="cv-flow" d={`M${x} 120 V180`} style={{ animationDelay: `${i * 0.3}s` }} />)}
          {[260, 290, 320].map((x) => <rect key={x} x={x - 10} y="180" width="20" height="12" rx="2" fill="#0a1630" />)}
        </g>
      );
    case "chip":
      return (
        <g {...S}>
          <rect x="250" y="50" width="100" height="100" rx="10" fill="#0a1630" strokeOpacity=".7" />
          <rect x="275" y="75" width="50" height="50" rx="4" className="cv-blink" />
          {[0, 1, 2, 3].map((i) => <path key={i} className="cv-flow" d={`M${265 + i * 23} 50 V25 M${265 + i * 23} 150 V175 M250 ${65 + i * 23} H225 M350 ${65 + i * 23} H375`} />)}
        </g>
      );
    case "globe":
      return (
        <g {...S}>
          <circle cx="300" cy="100" r="62" fill="#0a1630" strokeOpacity=".6" />
          <ellipse cx="300" cy="100" rx="26" ry="62" />
          <path d="M238 100 H362 M246 70 H354 M246 130 H354" strokeOpacity=".35" />
          <g className="cv-spin" style={{ transformOrigin: "300px 100px", transformBox: "view-box" }}><ellipse cx="300" cy="100" rx="85" ry="24" strokeDasharray="4 6" /><circle cx="385" cy="100" r="4" fill="#7ef3ff" stroke="none" /></g>
        </g>
      );
    case "signal":
      return (
        <g {...S} strokeWidth="3">
          {[0, 1, 2, 3, 4].map((i) => <rect key={i} className="cv-grow" style={{ animationDelay: `${i * 0.15}s` }} x={250 + i * 22} y={160 - i * 22} width="14" height={20 + i * 22} rx="2" fill="#7ef3ff" fillOpacity=".25" />)}
          {[30, 55, 80].map((r, i) => <path key={r} className="cv-pulse" style={{ animationDelay: `${i * 0.35}s` }} d={`M${80 - r} ${120 - r * 0.6} A ${r} ${r} 0 0 1 ${80 + r} ${120 - r * 0.6}`} />)}
        </g>
      );
    case "lock":
      return (
        <g {...S} strokeWidth="2">
          <path d="M280 95 V75 a20 20 0 0 1 40 0 V95" />
          <rect x="265" y="95" width="70" height="60" rx="8" fill="#0a1630" />
          <circle cx="300" cy="122" r="7" className="cv-blink" fill="#22ff88" fillOpacity=".6" />
          {[50, 75].map((r, i) => <circle key={r} className="cv-pulse" style={{ animationDelay: `${i * 0.6}s` }} cx="300" cy="115" r={r} strokeOpacity=".2" />)}
        </g>
      );
    case "network":
    default: {
      const nodes = Array.from({ length: 8 }, (_, i) => [40 + ((h >> i) % 9) * 38, 30 + ((h >> (i + 2)) % 5) * 28]);
      return (
        <g>
          {nodes.slice(1).map(([x, y], i) => <line key={i} className="cv-flow" x1={nodes[i][0]} y1={nodes[i][1]} x2={x} y2={y} stroke="#cfe9ff" strokeOpacity=".35" />)}
          {nodes.map(([x, y], i) => <circle key={i} className="cv-blink" style={{ animationDelay: `${i * 0.3}s` }} cx={x} cy={y} r="5" fill="#0a1630" stroke="#7ef3ff" strokeOpacity=".8" />)}
        </g>
      );
    }
  }
}

/** Uses the post's cover image when provided, otherwise animated generated cover art in the chosen style. */
export function PostCover({ post, className }: { post: Pick<PostMeta, "title" | "category" | "cover" | "slug"> & { coverStyle?: string }; className?: string }) {
  if (post.cover) return <img src={look(post.cover).src} style={look(post.cover).style} alt="" loading="lazy" className={`${className ?? ""} object-cover`} />;
  const h = hashOf(post.slug);
  const style: CoverStyle = (coverStyles as readonly string[]).includes(post.coverStyle ?? "") ? (post.coverStyle as CoverStyle) : coverStyles[h % coverStyles.length];
  const [a, b] = PALETTES[h % PALETTES.length];
  const gid = `g-${post.slug}`;
  return (
    <svg viewBox="0 0 400 200" className={`cover-art ${className ?? ""}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} stopOpacity=".45" />
          <stop offset="1" stopColor={b} stopOpacity=".12" />
        </linearGradient>
      </defs>
      <rect width="400" height="200" fill="#070d1d" />
      <rect width="400" height="200" fill={`url(#${gid})`} />
      <Art style={style} h={h} />
      <text x="20" y="182" fill="#cfe9ff" fillOpacity=".6" fontSize="11" fontFamily="JetBrains Mono Variable, monospace" letterSpacing="2">{post.category.toUpperCase()}</text>
    </svg>
  );
}
