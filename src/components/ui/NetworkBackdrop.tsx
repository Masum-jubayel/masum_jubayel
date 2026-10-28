"use client";

import { useEffect, useRef } from "react";

/**
 * Lightweight 2D canvas network: drifting nodes, proximity links and travelling packets.
 * Pauses when off-screen or when the tab is hidden; renders a single static frame for reduced motion.
 */
export function NetworkBackdrop({ className, density = 0.00009, interactive = false }: { className?: string; density?: number; interactive?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, visible = true;
    type N = { x: number; y: number; vx: number; vy: number; r: number };
    let nodes: N[] = [];
    let packets: { a: number; b: number; t: number; s: number }[] = [];
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(14, Math.min(70, Math.floor(w * h * density)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.4 + 0.8,
      }));
      packets = [];
    };

    const LINK = 150;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(62,230,255,${0.16 * (1 - d / LINK)})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
            if (!reduce && packets.length < 10 && Math.random() < 0.0009) packets.push({ a: i, b: j, t: 0, s: 0.006 + Math.random() * 0.01 });
          }
        }
      }
      for (const n of nodes) {
        const near = interactive && Math.hypot(n.x - mouse.x, n.y - mouse.y) < 120;
        ctx.fillStyle = near ? "rgba(126,243,255,0.95)" : "rgba(126,180,255,0.55)";
        ctx.beginPath(); ctx.arc(n.x, n.y, near ? n.r + 1.2 : n.r, 0, Math.PI * 2); ctx.fill();
      }
      packets = packets.filter((p) => p.t <= 1);
      for (const p of packets) {
        const a = nodes[p.a], b = nodes[p.b];
        if (!a || !b) { p.t = 2; continue; }
        const x = a.x + (b.x - a.x) * p.t, y = a.y + (b.y - a.y) * p.t;
        const g = ctx.createRadialGradient(x, y, 0, x, y, 6);
        g.addColorStop(0, "rgba(126,243,255,0.9)"); g.addColorStop(1, "rgba(126,243,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill();
        p.t += p.s;
      }
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      draw();
      raf = visible ? requestAnimationFrame(step) : 0;
    };

    resize();
    if (reduce) draw(); else raf = requestAnimationFrame(step);

    const ro = new ResizeObserver(() => { resize(); if (reduce) draw(); });
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting && !document.hidden;
      if (visible && !raf && !reduce) raf = requestAnimationFrame(step);
    });
    io.observe(canvas);
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    if (interactive) window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [density, interactive]);

  return <canvas ref={ref} className={className} aria-hidden />;
}
