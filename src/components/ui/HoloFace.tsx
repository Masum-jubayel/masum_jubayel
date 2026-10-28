"use client";

import { useEffect, useRef } from "react";

/**
 * Masum's face as a glowing hologram (2D canvas): points built from the sketch point map,
 * a scan band sweeping down, a gentle 3D sway, cursor tilt, and points that scatter on hover
 * and snap back. Pauses off-screen; draws one still frame for reduced motion.
 */
const SRC = "/images/brand/pointmap.png";

type P = { hx: number; hy: number; x: number; y: number; vx: number; vy: number; ink: number; seed: number };

export function HoloFace({ className, color = "#7ef3ff", brightness = "bright", label = "MASUM JUBAYEL", sub = "IDENTITY · VERIFIED", src = SRC, invert = false }: { className?: string; color?: string; brightness?: string; label?: string; sub?: string; src?: string; invert?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const gain = brightness === "max" ? 1.35 : brightness === "bright" ? 1.15 : 0.9;
    let W = 0, H = 0, raf = 0, visible = true, pts: P[] = [];
    const mouse = { x: 0, y: 0, in: false };
    const start = performance.now();
    const img = new Image();

    const layout = () => {
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const sample = () => {
      const N = 150;
      const off = document.createElement("canvas"); off.width = N; off.height = N;
      const o = off.getContext("2d", { willReadFrequently: true })!;
      o.drawImage(img, 0, 0, N, N);
      const d = o.getImageData(0, 0, N, N).data;
      const size = Math.min(W, H * 0.82);
      const ox = (W - size) / 2, oy = H * 0.02;
      pts = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i4 = (y * N + x) * 4;
        const lum = (d[i4] * 0.3 + d[i4 + 1] * 0.59 + d[i4 + 2] * 0.11) / 255;
        const v = d[i4 + 3] < 40 ? 0 : invert ? lum : 1 - lum;
        if (v < 0.18 || Math.random() > Math.min(1, v * 1.1)) continue;
        const hx = ox + (x / N) * size, hy = oy + (y / N) * size;
        pts.push({ hx, hy, x: hx + (Math.random() - 0.5) * W, y: hy + (Math.random() - 0.5) * H, vx: 0, vy: 0, ink: v, seed: Math.random() });
      }
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const sway = reduce ? 0 : Math.sin(t * 0.5) * 0.12 + (mouse.in ? (mouse.x / W - 0.5) * 0.35 : 0);
      const scan = ((t % 4) / 4) * H * 0.9;
      // soft halo
      const g = ctx.createRadialGradient(cx, H * 0.42, 0, cx, H * 0.42, W * 0.5);
      g.addColorStop(0, `${color}26`); g.addColorStop(1, `${color}00`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = "lighter";
      for (const p of pts) {
        // spring back home; scatter away from the cursor
        let tx = cx + (p.hx - cx) * (1 - Math.abs(sway) * 0.5);
        const ty = p.hy;
        tx += (p.hy - H * 0.4) * sway * 0.15;
        if (mouse.in && !reduce) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, dd = dx * dx + dy * dy;
          if (dd < 2600) { const f = (2600 - dd) / 2600; p.vx += (dx / Math.sqrt(dd + 1)) * f * 2.2; p.vy += (dy / Math.sqrt(dd + 1)) * f * 2.2; }
        }
        if (reduce) { p.x = tx; p.y = ty; } else {
          p.vx += (tx - p.x) * 0.06; p.vy += (ty - p.y) * 0.06;
          p.vx *= 0.78; p.vy *= 0.78; p.x += p.vx; p.y += p.vy;
        }
        const near = Math.max(0, 1 - Math.abs(p.y - scan) / 22);
        const flick = reduce ? 1 : 0.85 + Math.sin(t * 6 + p.seed * 40) * 0.15;
        const a = Math.min(1, (0.35 + p.ink * 0.65 + near * 0.6) * gain * flick);
        const r = 0.7 + p.ink * 0.9 + near * 1.1;
        ctx.globalAlpha = a;
        ctx.fillStyle = near > 0.4 ? "#ffffff" : color;
        ctx.fillRect(p.x - r / 2, p.y - r / 2, r, r);
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      // scan line
      if (!reduce) {
        const sg = ctx.createLinearGradient(0, scan - 14, 0, scan + 14);
        sg.addColorStop(0, `${color}00`); sg.addColorStop(0.5, `${color}55`); sg.addColorStop(1, `${color}00`);
        ctx.fillStyle = sg; ctx.fillRect(W * 0.12, scan - 14, W * 0.76, 28);
      }
      // labels
      ctx.textAlign = "center";
      ctx.font = `600 ${Math.max(11, W * 0.055)}px 'JetBrains Mono Variable', monospace`;
      ctx.shadowColor = color; ctx.shadowBlur = 10; ctx.fillStyle = color;
      ctx.fillText(label, cx, H * 0.9);
      ctx.shadowBlur = 0; ctx.globalAlpha = 0.65;
      ctx.font = `${Math.max(9, W * 0.036)}px 'JetBrains Mono Variable', monospace`;
      ctx.fillText(sub, cx, H * 0.96);
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      draw((performance.now() - start) / 1000);
      raf = visible ? requestAnimationFrame(loop) : 0;
    };

    img.onload = () => { layout(); sample(); if (reduce) draw(0); else raf = requestAnimationFrame(loop); };
    img.crossOrigin = "anonymous";
    img.src = src || SRC;
    const ro = new ResizeObserver(() => { if (!img.complete) return; layout(); sample(); if (reduce) draw(0); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting && !document.hidden; if (visible && !raf && !reduce && pts.length) raf = requestAnimationFrame(loop); });
    io.observe(canvas);
    const move = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.in = true; };
    const leave = () => { mouse.in = false; };
    canvas.addEventListener("pointermove", move); canvas.addEventListener("pointerleave", leave);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); canvas.removeEventListener("pointermove", move); canvas.removeEventListener("pointerleave", leave); };
  }, [color, brightness, label, sub, src, invert]);

  return <canvas ref={ref} className={className} role="img" aria-label={`${label} — hologram portrait`} />;
}
