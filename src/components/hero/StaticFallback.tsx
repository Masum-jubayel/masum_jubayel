/** Lightweight static illustration used before the 3D scene loads, without WebGL, or in data-saver mode. */
export function StaticFallback({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 640 480" className={className} role="img" aria-label="Illustration of a network engineer’s workstation with multiple monitors and server racks">
      <defs>
        <linearGradient id="sf-screen" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#0a1a38" />
          <stop offset="1" stopColor="#050b19" />
        </linearGradient>
        <radialGradient id="sf-glow" cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor="#3ee6ff" stopOpacity="0.22" />
          <stop offset="1" stopColor="#3ee6ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="640" height="480" fill="transparent" />
      <ellipse cx="330" cy="220" rx="300" ry="190" fill="url(#sf-glow)" />
      {/* racks */}
      {[70, 170, 470, 570].map((x) => (
        <g key={x} opacity="0.55">
          <rect x={x - 38} y="70" width="76" height="250" rx="4" fill="#0a0f1c" stroke="#1d2d57" />
          {Array.from({ length: 12 }).map((_, i) => (
            <g key={i}>
              <rect x={x - 32} y={80 + i * 19} width="64" height="13" fill="#111a2c" />
              <circle cx={x - 24} cy={86.5 + i * 19} r="1.8" fill={i % 3 ? "#34d399" : "#3ee6ff"} />
              <circle cx={x - 17} cy={86.5 + i * 19} r="1.8" fill={i % 4 ? "#4f8cff" : "#fbbf24"} />
            </g>
          ))}
        </g>
      ))}
      {/* links */}
      <path d="M70 70 C 160 20, 260 40, 320 120" stroke="#3ee6ff" strokeOpacity=".35" fill="none" />
      <path d="M570 70 C 480 20, 380 40, 320 120" stroke="#8b5cf6" strokeOpacity=".35" fill="none" />
      {/* monitors */}
      {[
        [210, 120, 110, 70], [330, 120, 110, 70], [148, 205, 120, 76], [272, 200, 136, 82], [412, 205, 120, 76],
      ].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x - 3} y={y - 3} width={w + 6} height={h + 6} rx="5" fill="#0b0f19" stroke="#1d2d57" />
          <rect x={x} y={y} width={w} height={h} rx="2" fill="url(#sf-screen)" />
          {i === 3 ? (
            <g stroke="#3ee6ff" strokeOpacity=".6">
              <line x1={x + 68} y1={y + 16} x2={x + 36} y2={y + 44} /><line x1={x + 68} y1={y + 16} x2={x + 100} y2={y + 44} />
              <line x1={x + 36} y1={y + 44} x2={x + 24} y2={y + 68} /><line x1={x + 100} y1={y + 44} x2={x + 112} y2={y + 68} />
              {[[68, 16], [36, 44], [100, 44], [24, 68], [112, 68]].map(([a, b], k) => <circle key={k} cx={x + a} cy={y + b} r="4" fill="#0a1630" />)}
            </g>
          ) : (
            Array.from({ length: 5 }).map((_, k) => (
              <rect key={k} x={x + 8} y={y + 10 + k * 11} width={(w - 16) * (0.4 + ((k * 37 + i * 11) % 50) / 100)} height="4" rx="2" fill={k % 2 ? "#4f8cff" : "#3ee6ff"} opacity=".55" />
            ))
          )}
        </g>
      ))}
      {/* desk */}
      <rect x="110" y="292" width="440" height="10" rx="3" fill="#0f1626" />
      <rect x="110" y="300" width="440" height="2" fill="#3ee6ff" opacity=".7" />
      <rect x="130" y="302" width="10" height="120" fill="#121a2c" /><rect x="520" y="302" width="10" height="120" fill="#121a2c" />
      {/* engineer (rear three-quarter silhouette) */}
      <g>
        <rect x="292" y="300" width="76" height="110" rx="10" fill="#141a28" />
        <path d="M290 330 Q 288 262 330 252 Q 372 262 370 330 Z" fill="#1c2742" />
        <circle cx="330" cy="236" r="21" fill="#a87a5c" />
        <path d="M309 234 Q 310 212 330 212 Q 352 212 351 236 Q 340 226 330 226 Q 318 228 309 234 Z" fill="#121214" />
        <path d="M309 240 Q 306 216 330 214 Q 354 216 351 240" stroke="#1a1f2b" strokeWidth="3" fill="none" />
      </g>
    </svg>
  );
}
