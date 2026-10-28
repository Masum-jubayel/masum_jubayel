import type { ScreenKind } from "./sceneConfig";

/** Canvas-drawn monitor UIs. All data is synthetic/illustrative (RFC1918 lab addressing). */

export const SCREEN_W = 640;
export const SCREEN_H = 400;

const C = {
  bg: "#050b19",
  panel: "#0a1630",
  line: "rgba(126,243,255,0.18)",
  cyan: "#3ee6ff",
  blue: "#4f8cff",
  violet: "#a78bfa",
  green: "#34d399",
  amber: "#fbbf24",
  red: "#f87171",
  text: "#cfdbf2",
  dim: "#5b6a8c",
};

function frame(ctx: CanvasRenderingContext2D, title: string, status = "ONLINE") {
  ctx.fillStyle = C.bg;
  ctx.fillRect(0, 0, SCREEN_W, SCREEN_H);
  // subtle grid
  ctx.strokeStyle = "rgba(126,243,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < SCREEN_W; x += 32) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, SCREEN_H); ctx.stroke(); }
  for (let y = 0; y < SCREEN_H; y += 32) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(SCREEN_W, y); ctx.stroke(); }
  // header
  ctx.fillStyle = C.panel;
  ctx.fillRect(0, 0, SCREEN_W, 34);
  ctx.fillStyle = C.cyan;
  ctx.font = "600 15px 'JetBrains Mono', monospace";
  ctx.fillText(title, 14, 22);
  ctx.fillStyle = C.green;
  ctx.beginPath(); ctx.arc(SCREEN_W - 92, 17, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.dim;
  ctx.font = "12px 'JetBrains Mono', monospace";
  ctx.fillText(status, SCREEN_W - 82, 21);
}

// ---------- Topology ----------
const topo = {
  nodes: [
    { id: "WAN", x: 320, y: 70, c: C.violet },
    { id: "FW1", x: 320, y: 140, c: C.red },
    { id: "R1", x: 200, y: 200, c: C.cyan },
    { id: "R2", x: 440, y: 200, c: C.cyan },
    { id: "SW1", x: 130, y: 290, c: C.blue },
    { id: "SW2", x: 320, y: 290, c: C.blue },
    { id: "SW3", x: 510, y: 290, c: C.blue },
    { id: "AP", x: 70, y: 360, c: C.green },
    { id: "SRV", x: 320, y: 360, c: C.amber },
    { id: "POS", x: 570, y: 360, c: C.green },
  ],
  links: [[0, 1], [1, 2], [1, 3], [2, 3], [2, 4], [2, 5], [3, 5], [3, 6], [4, 7], [5, 8], [6, 9]] as [number, number][],
};

function drawTopology(ctx: CanvasRenderingContext2D, t: number) {
  frame(ctx, "TOPOLOGY · OSPF AREA 0", "LAB");
  ctx.lineWidth = 2;
  for (const [a, b] of topo.links) {
    const A = topo.nodes[a], B = topo.nodes[b];
    ctx.strokeStyle = C.line;
    ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
  }
  topo.links.forEach(([a, b], i) => {
    const A = topo.nodes[a], B = topo.nodes[b];
    const p = (t * 0.35 + i * 0.37) % 1;
    const x = A.x + (B.x - A.x) * p, y = A.y + (B.y - A.y) * p;
    ctx.fillStyle = i % 3 === 0 ? C.violet : C.cyan;
    ctx.beginPath(); ctx.arc(x, y, 3.2, 0, Math.PI * 2); ctx.fill();
  });
  for (const n of topo.nodes) {
    ctx.fillStyle = C.panel;
    ctx.strokeStyle = n.c;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(n.x - 26, n.y - 14, 52, 28, 6); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.text;
    ctx.font = "600 12px 'JetBrains Mono', monospace";
    ctx.textAlign = "center";
    ctx.fillText(n.id, n.x, n.y + 4);
    ctx.textAlign = "left";
  }
}

// ---------- Terminal ----------
const termLines = [
  { c: C.cyan, s: "SW1# show vlan brief" },
  { c: C.text, s: "VLAN Name             Status    Ports" },
  { c: C.dim, s: "10   USERS            active    Gi0/2-12" },
  { c: C.dim, s: "20   VOICE            active    Gi0/13-20" },
  { c: C.dim, s: "30   IOT              active    Gi0/21-24" },
  { c: C.cyan, s: "R1# show ip ospf neighbor" },
  { c: C.text, s: "Neighbor ID   Pri  State     Address" },
  { c: C.dim, s: "10.0.0.2       1   FULL/DR   10.0.12.2" },
  { c: C.cyan, s: "R1# ping 10.0.30.1 repeat 5" },
  { c: C.green, s: "!!!!!  Success rate is 100 percent (5/5)" },
  { c: C.cyan, s: "SW2# show interfaces trunk" },
  { c: C.dim, s: "Gi0/1  on  802.1q  trunking  1" },
  { c: C.cyan, s: "R2# show ip route ospf" },
  { c: C.dim, s: "O  10.0.20.0/24 [110/2] via 10.0.12.1" },
  { c: C.cyan, s: "$ adb devices" },
  { c: C.dim, s: "List of devices attached" },
  { c: C.green, s: "LAB-RADIO-01   device" },
];

function drawTerminal(ctx: CanvasRenderingContext2D, t: number) {
  frame(ctx, "CONSOLE · ssh lab-core", "SSH");
  ctx.font = "14px 'JetBrains Mono', monospace";
  const lh = 20;
  const visible = 17;
  const total = termLines.length;
  const typed = Math.floor(t * 2.2);
  const start = Math.max(0, (typed % (total + 6)) - visible + 1);
  const end = Math.min(total, typed % (total + 6));
  let y = 58;
  for (let i = start; i <= end && i < total; i++) {
    const ln = termLines[i];
    ctx.fillStyle = ln.c;
    const s = i === end ? ln.s.slice(0, Math.floor(((t * 2.2) % 1) * ln.s.length) + 1) : ln.s;
    ctx.fillText(s, 14, y);
    y += lh;
  }
  if (Math.floor(t * 2) % 2 === 0) {
    ctx.fillStyle = C.cyan;
    ctx.fillRect(14, y - 14, 9, 16);
  }
}

// ---------- Traffic ----------
function drawTraffic(ctx: CanvasRenderingContext2D, t: number) {
  frame(ctx, "TRAFFIC · Gi0/1 uplink", "LIVE");
  const x0 = 40, y0 = 70, w = SCREEN_W - 70, h = 220;
  ctx.strokeStyle = "rgba(126,243,255,0.08)";
  for (let i = 0; i <= 4; i++) { const y = y0 + (h / 4) * i; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke(); }
  const series = (phase: number, amp: number, base: number) => (i: number) =>
    base + Math.sin(i * 0.18 + t * 1.4 + phase) * amp + Math.sin(i * 0.05 + t * 0.6 + phase * 2) * amp * 0.6;
  const draw = (f: (i: number) => number, color: string, fill: boolean) => {
    ctx.beginPath();
    for (let i = 0; i <= 60; i++) {
      const x = x0 + (w / 60) * i, y = y0 + h - f(i) * h;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.stroke();
    if (fill) {
      ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0, y0 + h); ctx.closePath();
      const g = ctx.createLinearGradient(0, y0, 0, y0 + h);
      g.addColorStop(0, "rgba(62,230,255,0.28)"); g.addColorStop(1, "rgba(62,230,255,0)");
      ctx.fillStyle = g; ctx.fill();
    }
  };
  draw(series(0, 0.14, 0.55), C.cyan, true);
  draw(series(1.7, 0.1, 0.3), C.violet, false);
  ctx.font = "13px 'JetBrains Mono', monospace";
  const stats = [
    ["IN", `${(420 + Math.sin(t) * 60).toFixed(0)} Mbps`, C.cyan],
    ["OUT", `${(180 + Math.cos(t * 0.8) * 40).toFixed(0)} Mbps`, C.violet],
    ["LOSS", "0.00 %", C.green],
    ["LAT", `${(4 + Math.sin(t * 2) * 1.2).toFixed(1)} ms`, C.amber],
  ] as const;
  stats.forEach(([k, v, c], i) => {
    const x = 20 + i * 155;
    ctx.fillStyle = C.panel; ctx.fillRect(x, 320, 140, 60);
    ctx.fillStyle = C.dim; ctx.fillText(k, x + 12, 342);
    ctx.fillStyle = c; ctx.font = "600 17px 'JetBrains Mono', monospace"; ctx.fillText(v, x + 12, 368);
    ctx.font = "13px 'JetBrains Mono', monospace";
  });
}

// ---------- Security ----------
const fwEvents = [
  ["ALLOW", "tcp 10.0.10.24 → 10.0.30.5:443"],
  ["ALLOW", "udp 10.0.20.11 → 10.0.0.53:53"],
  ["DENY", "tcp 203.0.113.9 → 10.0.30.5:22"],
  ["ALLOW", "tcp 10.0.10.31 → 10.0.30.8:443"],
  ["ALERT", "port-scan pattern 198.51.100.4"],
  ["DENY", "tcp 10.0.40.7 → 10.0.10.0/24"],
  ["ALLOW", "icmp 10.0.10.2 → 10.0.0.1"],
  ["DENY", "tcp 192.0.2.77 → 10.0.0.1:23"],
];

function drawSecurity(ctx: CanvasRenderingContext2D, t: number) {
  frame(ctx, "FIREWALL · EVENT MONITOR", "ARMED");
  // shield gauge
  const cx = 110, cy = 150, r = 62;
  ctx.lineWidth = 10;
  ctx.strokeStyle = "rgba(126,243,255,0.1)";
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = C.cyan;
  ctx.beginPath(); ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * (0.86 + Math.sin(t) * 0.02)); ctx.stroke();
  ctx.fillStyle = C.text; ctx.font = "600 24px 'JetBrains Mono', monospace"; ctx.textAlign = "center";
  ctx.fillText("86%", cx, cy + 8);
  ctx.fillStyle = C.dim; ctx.font = "11px 'JetBrains Mono', monospace";
  ctx.fillText("POLICY HIT", cx, cy + 28);
  ctx.textAlign = "left";
  // counters
  [["BLOCKED", "1,204", C.red], ["ALERTS", "3", C.amber], ["SESSIONS", "862", C.green]].forEach(([k, v, c], i) => {
    ctx.fillStyle = C.dim; ctx.font = "11px 'JetBrains Mono', monospace"; ctx.fillText(k, 30, 252 + i * 46);
    ctx.fillStyle = c; ctx.font = "600 20px 'JetBrains Mono', monospace"; ctx.fillText(v, 30, 274 + i * 46);
  });
  // log
  ctx.font = "13px 'JetBrains Mono', monospace";
  const offset = Math.floor(t * 1.1);
  for (let i = 0; i < 12; i++) {
    const [act, msg] = fwEvents[(i + offset) % fwEvents.length];
    const y = 62 + i * 27;
    ctx.fillStyle = i % 2 ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.03)";
    ctx.fillRect(220, y - 16, 405, 24);
    ctx.fillStyle = act === "ALLOW" ? C.green : act === "DENY" ? C.red : C.amber;
    ctx.fillText(act.padEnd(5), 230, y);
    ctx.fillStyle = C.text;
    ctx.fillText(msg, 290, y);
  }
}

// ---------- Servers ----------
function drawServers(ctx: CanvasRenderingContext2D, t: number) {
  frame(ctx, "INFRA · RACK HEALTH", "NOMINAL");
  const hosts = ["core-sw-01", "core-rtr-01", "srv-files", "srv-nvr", "srv-inventory", "ups-01"];
  ctx.font = "13px 'JetBrains Mono', monospace";
  hosts.forEach((h, i) => {
    const y = 62 + i * 54;
    ctx.fillStyle = C.panel; ctx.fillRect(14, y - 18, SCREEN_W - 28, 44);
    ctx.fillStyle = C.green; ctx.beginPath(); ctx.arc(30, y + 4, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = C.text; ctx.fillText(h, 44, y + 8);
    const metrics: [string, number, string][] = [
      ["CPU", 0.25 + 0.2 * Math.abs(Math.sin(t * 0.7 + i)), C.cyan],
      ["MEM", 0.45 + 0.1 * Math.sin(t * 0.3 + i * 2), C.blue],
      ["TMP", 0.35 + 0.05 * Math.sin(t * 0.2 + i), C.amber],
    ];
    metrics.forEach(([k, v, c], j) => {
      const x = 210 + j * 140;
      ctx.fillStyle = C.dim; ctx.fillText(k, x, y + 8);
      ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(x + 36, y - 2, 88, 12);
      ctx.fillStyle = c; ctx.fillRect(x + 36, y - 2, 88 * v, 12);
    });
  });
}

export const drawers: Record<ScreenKind, (ctx: CanvasRenderingContext2D, t: number) => void> = {
  topology: drawTopology,
  terminal: drawTerminal,
  traffic: drawTraffic,
  security: drawSecurity,
  servers: drawServers,
};
