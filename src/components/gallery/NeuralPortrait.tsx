"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Neural monitor" point cloud: Masum's sketch portrait is rebuilt from thousands of points
 * inside the brand triangle, with "Masum Jubayel" glowing along the top edge. A scan glides
 * region by region, the cloud briefly lets go into a constellation, then snaps back.
 * Canvas 2D · paused off-screen · a single still frame for reduced motion.
 */
const SRC = "/images/brand/pointmap.png";
const REGIONS = 6;
const PHASES = ["Acquiring signal", "Scanning", "Identity locked", "Releasing"] as const;

type P = { hx: number; hy: number; x: number; y: number; sx: number; sy: number; vx: number; vy: number; w: number; ox: number; oy: number };
export type PortraitSettings = { src?: string; invert?: boolean; nameA?: string; nameB?: string; colorA?: string; colorB?: string; speed?: string; density?: string; interactive?: boolean; orbit?: boolean };

const rgb = (hex: string, fb: string) => { const m = /^#?([0-9a-f]{6})$/i.exec(hex || ""); const h = m ? m[1] : fb; return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)].join(","); };

export function NeuralPortrait({ className, hud: showHud = true, settings = {} }: { className?: string; hud?: boolean; settings?: PortraitSettings }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [hud, setHud] = useState<{ phase: string; region: number; nodes: number }>({ phase: PHASES[0], region: 0, nodes: 0 });
  const { src = "", invert = false, nameA = "Masum", nameB = "Jubayel", colorA = "#22c55e", colorB = "#ef4444", speed = "normal", density = "normal", interactive = true, orbit = true } = settings;

  useEffect(() => {
    const k = speed === "slow" ? 1.5 : speed === "fast" ? 0.65 : 1;
    const T = { assemble: 2.2 * k, scan: 6.0 * k, hold: 1.6 * k, release: 2.6 * k };
    const LOOP = T.assemble + T.scan + T.hold + T.release;
    const dens = density === "light" ? 0.55 : density === "dense" ? 1.45 : 1;
    const MAX_POINTS = Math.round(5200 * dens);
    const cA = rgb(colorA, "22c55e"), cB = rgb(colorB, "ef4444");
    const nA = `${nameA.trim()} `, nB = nameB.trim();
    const ptr = { x: -9999, y: -9999, on: false, down: 0, dx: 0, dy: 0 };
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0, H = 0, raf = 0, visible = true, start = performance.now(), lastHud = "";
    let pts: P[] = [];
    let links: number[] = [];
    let box = { x: 0, y: 0, s: 1 };
    const img = new Image();

    const layout = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const s = Math.min(W * 0.92, H * 0.84);
      box = { x: (W - s) / 2, y: H * 0.13, s };
    };

    // Inverted triangle: top-left, top-right, bottom point
    const tri = () => ({ ax: box.x, ay: box.y, bx: box.x + box.s, by: box.y, cx: box.x + box.s / 2, cy: box.y + box.s * 0.98 });
    const inside = (x: number, y: number) => {
      const t = tri();
      if (y < t.ay) return false;
      const k = (y - t.ay) / (t.cy - t.ay);
      const half = (box.s / 2) * (1 - k);
      return k <= 1 && Math.abs(x - t.cx) <= half - 2;
    };

    const sample = () => {
      const N = 230;
      const off = document.createElement("canvas");
      off.width = N; off.height = N;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      const ar = img.naturalWidth / img.naturalHeight || 1;
      const dw = ar >= 1 ? N : N * ar, dh = ar >= 1 ? N / ar : N;
      o.fillStyle = invert ? "#000" : "#fff"; o.fillRect(0, 0, N, N);
      o.drawImage(img, (N - dw) / 2, (N - dh) / 2, dw, dh);
      const d = o.getImageData(0, 0, N, N).data;
      const out: P[] = [];
      // portrait occupies the upper part of the triangle
      const ps = box.s * 0.86, px = box.x + (box.s - ps) / 2, py = box.y + box.s * 0.02;
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = (y * N + x) * 4;
        const lum = (d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114) / 255;
        const ink = invert ? lum : 1 - lum;
        if (ink < 0.18 || Math.random() > Math.min(1, Math.pow(ink, 1.15) * 0.8 * dens)) continue;
        const hx = px + (x / N) * ps + (Math.random() - 0.5) * 1.2;
        const hy = py + (y / N) * ps + (Math.random() - 0.5) * 1.2;
        if (!inside(hx, hy)) continue;
        const sx = Math.random() * W, sy = Math.random() * H;
        out.push({ hx, hy, x: sx, y: sy, sx, sy, vx: 0, vy: 0, w: ink, ox: 0, oy: 0 });
      }
      pts = out.length > MAX_POINTS ? out.sort(() => Math.random() - 0.5).slice(0, MAX_POINTS) : out;
      links = Array.from({ length: Math.min(160, pts.length) }, () => Math.floor(Math.random() * pts.length));
      setHud((h) => ({ ...h, nodes: pts.length }));
    };

    const ease = (t: number) => 1 - Math.pow(1 - t, 3);

    const drawFrame = (alpha: number, nameAlpha: number) => {
      const t = tri();
      const g = ctx.createLinearGradient(t.ax, 0, t.bx, 0);
      g.addColorStop(0, `rgba(${cA},${alpha})`); g.addColorStop(1, `rgba(${cB},${alpha})`);
      const fs = Math.max(18, box.s * 0.115);
      ctx.font = `${fs}px 'Kaushan Script', cursive`;
      const mW = ctx.measureText(nA).width, jW = ctx.measureText(nB).width;
      const tw = mW + jW, tx = t.cx - tw / 2, pad = fs * 0.35;

      ctx.save();
      ctx.shadowBlur = 14; ctx.shadowColor = "rgba(62,230,255,0.35)";
      ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(tx - pad, t.ay); ctx.lineTo(t.ax, t.ay); ctx.lineTo(t.cx, t.cy); ctx.lineTo(t.bx, t.by); ctx.lineTo(tx + tw + pad, t.by);
      ctx.stroke();
      // signature on the top edge
      ctx.globalAlpha = nameAlpha;
      ctx.textBaseline = "middle";
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(${cA},0.8)`; ctx.fillStyle = `rgb(${cA})`; ctx.fillText(nA, tx, t.ay);
      ctx.shadowColor = `rgba(${cB},0.8)`; ctx.fillStyle = `rgb(${cB})`; ctx.fillText(nB, tx + mW, t.ay);
      ctx.restore();
    };

    const frame = (now: number) => {
      raf = visible && !reduce ? requestAnimationFrame(frame) : 0;
      const t = ((now - start) / 1000) % LOOP;
      ctx.clearRect(0, 0, W, H);

      const tt = tri();
      const top = box.y + box.s * 0.04, bottom = tt.cy;
      const bandH = (bottom - top) / REGIONS;
      let phase = 0, region = 0, bandY = -1, nameAlpha = 1;
      if (t < T.assemble) {
        phase = 0;
        const k = ease(t / T.assemble);
        nameAlpha = k;
        for (const p of pts) { p.x = p.sx + (p.hx - p.sx) * k; p.y = p.sy + (p.hy - p.sy) * k; }
      } else if (t < T.assemble + T.scan) {
        phase = 1;
        const st = (t - T.assemble) / T.scan;
        region = Math.min(REGIONS - 1, Math.floor(st * REGIONS));
        const local = st * REGIONS - region;
        const glide = local < 0.65 ? ease(local / 0.65) : 1;
        bandY = top + (region + glide) * bandH - bandH / 2;
        for (const p of pts) { p.x = p.hx; p.y = p.hy; }
      } else if (t < T.assemble + T.scan + T.hold) {
        phase = 2;
        for (const p of pts) { p.x = p.hx; p.y = p.hy; }
      } else {
        phase = 3;
        const rt = t - T.assemble - T.scan - T.hold;
        nameAlpha = Math.max(0.35, 1 - rt / T.release);
        if (pts[0] && pts[0].vx === 0 && pts[0].vy === 0) {
          const cx = tt.cx, cy = box.y + box.s * 0.4;
          for (const p of pts) {
            const a = Math.atan2(p.hy - cy, p.hx - cx) + (Math.random() - 0.5) * 1.4;
            const sp = 0.25 + Math.random() * 1.05;
            p.vx = Math.cos(a) * sp || 0.01; p.vy = Math.sin(a) * sp || 0.01;
          }
        }
        for (const p of pts) {
          p.x += p.vx; p.y += p.vy; p.vx *= 0.982; p.vy *= 0.982;
          p.vx += (Math.random() - 0.5) * 0.03; p.vy += (Math.random() - 0.5) * 0.03;
        }
        if (rt > T.release - 0.05) for (const p of pts) { p.sx = p.x; p.sy = p.y; p.vx = 0; p.vy = 0; }
      }

      if (phase === 3) {
        const rt = t - T.assemble - T.scan - T.hold;
        const la = Math.min(1, rt / 0.8) * Math.min(1, (T.release - rt) / 0.6);
        ctx.lineWidth = 0.6;
        for (let i = 0; i < links.length; i++) for (let j = i + 1; j < links.length; j++) {
          const a = pts[links[i]], b = pts[links[j]];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < 7000) {
            ctx.strokeStyle = `rgba(126,243,255,${0.22 * la * (1 - d2 / 7000)})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        let r = 150 + 90 * p.w, g = 205 + 45 * p.w, b = 255, al = 0.35 + p.w * 0.6;
        let s = 0.9 + p.w * 1.0;
        if (bandY >= 0) {
          const dist = Math.abs(p.y - bandY);
          if (dist < bandH * 0.6) { const k = 1 - dist / (bandH * 0.6); r = 126 + 110 * k; g = 243; b = 255; al = Math.min(1, al + 0.5 * k); s += k * 0.9; }
        }
        if (phase === 2) { r = 210; g = 250; b = 255; al = Math.min(1, al + 0.2); }
        if (interactive) {
          let tx = 0, ty = 0;
          if (ptr.on) {
            const dx = p.x - ptr.x, dy = p.y - ptr.y, d2 = dx * dx + dy * dy, R = 90;
            if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = Math.pow(1 - d / R, 2) * 34; tx = (dx / d) * f; ty = (dy / d) * f; r = 126 + 90 * (f / 34); g = 243; al = Math.min(1, al + 0.4 * (f / 34)); }
          }
          p.ox += (tx - p.ox) * 0.14; p.oy += (ty - p.oy) * 0.14;
        }
        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b},${al})`;
        ctx.fillRect(p.x + p.ox - s / 2, p.y + p.oy - s / 2, s, s);
      }
      if (interactive && ptr.on) {
        const gl = ctx.createRadialGradient(ptr.x, ptr.y, 0, ptr.x, ptr.y, 70);
        gl.addColorStop(0, "rgba(62,230,255,0.16)"); gl.addColorStop(1, "rgba(62,230,255,0)");
        ctx.fillStyle = gl; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 70, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(126,243,255,0.35)"; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 18 + Math.sin(now / 200) * 3, 0, Math.PI * 2); ctx.stroke();
      }
      if (orbit) {
        const cx = tt.cx, cy = box.y + box.s * 0.42, a = now / 4200;
        for (let k = 0; k < 2; k++) {
          const rx = box.s * (0.56 + k * 0.08), ry = box.s * (0.16 + k * 0.05), rot = (k ? -0.35 : 0.3) + Math.sin(a * 0.6 + k) * 0.08;
          ctx.save(); ctx.translate(cx, cy); ctx.rotate(rot);
          ctx.setLineDash([2, 7]); ctx.strokeStyle = `rgba(${k ? cB : cA},0.22)`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
          for (let j = 0; j < 3; j++) {
            const th = a * (k ? -1.4 : 1.1) + (j * Math.PI * 2) / 3;
            const px = Math.cos(th) * rx, py = Math.sin(th) * ry;
            ctx.fillStyle = `rgba(${j % 2 ? cB : cA},0.9)`; ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${j % 2 ? cB : cA},0.9)`;
            ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
          }
          ctx.restore();
        }
      }

      if (bandY >= 0) {
        const gr = ctx.createLinearGradient(0, bandY - bandH / 2, 0, bandY + bandH / 2);
        gr.addColorStop(0, "rgba(62,230,255,0)"); gr.addColorStop(0.5, "rgba(62,230,255,0.09)"); gr.addColorStop(1, "rgba(62,230,255,0)");
        ctx.fillStyle = gr; ctx.fillRect(box.x, bandY - bandH / 2, box.s, bandH);
        ctx.strokeStyle = "rgba(126,243,255,0.7)"; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(box.x - 10, bandY); ctx.lineTo(box.x + box.s + 10, bandY); ctx.stroke();
        ctx.fillStyle = "rgba(126,243,255,0.9)"; ctx.font = "10px 'JetBrains Mono Variable', monospace"; ctx.textBaseline = "alphabetic";
        ctx.fillText(`R${String(region + 1).padStart(2, "0")}`, Math.min(W - 30, box.x + box.s + 14), bandY + 3);
      }
      drawFrame(phase === 3 ? 0.25 : phase === 2 ? 0.95 : 0.6, nameAlpha);

      const key = `${phase}-${region}`;
      if (key !== lastHud) { lastHud = key; setHud((h) => ({ ...h, phase: PHASES[phase], region: phase === 1 ? region + 1 : 0 })); }
    };

    const boot = () => {
      layout();
      sample();
      if (reduce) { for (const p of pts) { p.x = p.hx; p.y = p.hy; } start = performance.now() - (T.assemble + T.scan + 0.2) * 1000; frame(performance.now()); }
      else { start = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); }
    };
    img.onload = () => {
      const fonts = (document as Document & { fonts?: FontFaceSet }).fonts;
      if (fonts?.load) fonts.load("40px 'Kaushan Script'").finally(boot); else boot();
    };
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.onerror = () => { if (img.src.indexOf(SRC) < 0) img.src = SRC; };
    img.src = (src ? src.split("#")[0] : "") || SRC;

    // Pointer: points flee the cursor; a tap / click scatters the cloud into a constellation.
    const pos = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; };
    const move = (e: PointerEvent) => { pos(e); ptr.on = true; };
    const leave = () => { ptr.on = false; };
    const down = (e: PointerEvent) => { pos(e); ptr.down = performance.now(); ptr.dx = ptr.x; ptr.dy = ptr.y; };
    const up = (e: PointerEvent) => {
      pos(e);
      if (performance.now() - ptr.down < 350 && Math.hypot(ptr.x - ptr.dx, ptr.y - ptr.dy) < 12) {
        const tNow = ((performance.now() - start) / 1000) % LOOP;
        if (tNow < T.assemble + T.scan + T.hold) { for (const p of pts) { p.vx = 0; p.vy = 0; } start = performance.now() - (T.assemble + T.scan + T.hold) * 1000; }
      }
      if (e.pointerType !== "mouse") ptr.on = false;
    };
    if (interactive && !reduce) {
      canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
      canvas.addEventListener("pointerdown", down); canvas.addEventListener("pointerup", up);
    }

    const ro = new ResizeObserver(() => { if (img.complete && img.naturalWidth) { layout(); sample(); } });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      if (visible && !raf && !reduce && pts.length) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave);
      canvas.removeEventListener("pointerdown", down); canvas.removeEventListener("pointerup", up);
    };
  }, [src, invert, nameA, nameB, colorA, colorB, speed, density, interactive, orbit]);

  return (
    <div className={className}>
      <canvas ref={ref} className={`h-full w-full ${interactive ? "cursor-crosshair touch-pan-y" : ""}`} aria-hidden />
      {interactive && <p className="pointer-events-none absolute bottom-3 right-3 font-mono text-[9px] uppercase tracking-[0.25em] text-mist-600" aria-hidden>Move to disturb · tap to scatter</p>}
      {showHud && <div className="pointer-events-none absolute left-2 top-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-300/80 sm:left-4 sm:top-4" aria-hidden>
        <p className="flex items-center gap-2"><span className="h-1.5 w-1.5 animate-pulseDot rounded-full bg-cyan-400" />{hud.phase}</p>
        <p className="mt-1 text-mist-500">Nodes {hud.nodes.toLocaleString()} {hud.region ? `· Region ${String(hud.region).padStart(2, "0")}/${String(REGIONS).padStart(2, "0")}` : ""}</p>
      </div>}
    </div>
  );
}
