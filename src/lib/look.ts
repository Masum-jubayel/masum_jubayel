import type { CSSProperties } from "react";

/**
 * Non-destructive photo / video adjustments, stored in the file URL's #fragment
 * (so every place that already saves a URL — gallery, memories, blog, projects, about —
 * can carry them without a database change). The original file is never modified.
 *
 *   https://…/photo.jpg#look=50,30,120,0,0,100,100,100,0,0,0,0,c,0,0,0
 */
export type Look = {
  x: number; y: number;        // focal point, % (object-position)
  zoom: number;                // 100 = none
  rot: number;                 // degrees
  flip: boolean;               // mirror horizontally
  bright: number; contrast: number; sat: number; // 100 = none
  gray: number; sepia: number; // 0–100
  hue: number;                 // degrees
  blur: number;                // px
  fit: "cover" | "contain";
  t0: number; t1: number;      // video start / end in seconds (0 = untouched)
  vign: number;                // vignette 0–100
};

export const defaultLook: Look = { x: 50, y: 50, zoom: 100, rot: 0, flip: false, bright: 100, contrast: 100, sat: 100, gray: 0, sepia: 0, hue: 0, blur: 0, fit: "cover", t0: 0, t1: 0, vign: 0 };

const ORDER = ["x", "y", "zoom", "rot", "flip", "bright", "contrast", "sat", "gray", "sepia", "hue", "blur", "fit", "t0", "t1", "vign"] as const;
const clamp = (n: number, a: number, b: number) => Math.min(b, Math.max(a, Number.isFinite(n) ? n : a));

function fragment(url: string) {
  const i = url.indexOf("#");
  return i < 0 ? { base: url, params: new URLSearchParams() } : { base: url.slice(0, i), params: new URLSearchParams(url.slice(i + 1)) };
}

/** The adjustments saved on a URL (or the defaults). */
export function getLook(url?: string | null): Look {
  if (!url) return { ...defaultLook };
  const raw = fragment(url).params.get("look");
  if (!raw) return { ...defaultLook };
  const v = raw.split(",");
  const n = (i: number, d: number) => (v[i] === undefined || v[i] === "" ? d : Number(v[i]));
  return {
    x: clamp(n(0, 50), 0, 100), y: clamp(n(1, 50), 0, 100), zoom: clamp(n(2, 100), 50, 400), rot: clamp(n(3, 0), -180, 180), flip: v[4] === "1",
    bright: clamp(n(5, 100), 0, 250), contrast: clamp(n(6, 100), 0, 250), sat: clamp(n(7, 100), 0, 300), gray: clamp(n(8, 0), 0, 100),
    sepia: clamp(n(9, 0), 0, 100), hue: clamp(n(10, 0), -180, 180), blur: clamp(n(11, 0), 0, 20), fit: v[12] === "n" ? "contain" : "cover",
    t0: clamp(n(13, 0), 0, 36000), t1: clamp(n(14, 0), 0, 36000), vign: clamp(n(15, 0), 0, 100),
  };
}

export const isDefaultLook = (l: Look) => ORDER.every((k) => l[k] === defaultLook[k]);

/** The URL with these adjustments saved on it (or removed, when they are all default). */
export function withLook(url: string, look: Look): string {
  const { base, params } = fragment(url);
  if (isDefaultLook(look)) params.delete("look");
  else params.set("look", ORDER.map((k) => (k === "flip" ? (look.flip ? "1" : "0") : k === "fit" ? (look.fit === "contain" ? "n" : "c") : String(Math.round(Number(look[k]) * 10) / 10))).join(","));
  const f = params.toString().replace(/%2C/g, ",");
  return f ? `${base}#${f}` : base;
}

/** The URL without the #look fragment (other hints such as #kind= are kept). */
export function stripLook(url: string): string {
  const { base, params } = fragment(url);
  params.delete("look");
  const f = params.toString();
  return f ? `${base}#${f}` : base;
}

export function lookFilter(l: Look): string | undefined {
  const parts = [
    l.bright !== 100 && `brightness(${l.bright}%)`, l.contrast !== 100 && `contrast(${l.contrast}%)`, l.sat !== 100 && `saturate(${l.sat}%)`,
    l.gray > 0 && `grayscale(${l.gray}%)`, l.sepia > 0 && `sepia(${l.sepia}%)`, l.hue !== 0 && `hue-rotate(${l.hue}deg)`, l.blur > 0 && `blur(${l.blur}px)`,
  ].filter(Boolean);
  return parts.length ? parts.join(" ") : undefined;
}

/** Inline style for an <img> / <video> showing this look. Only sets what was changed, so page classes still apply. */
export function lookStyle(l: Look): CSSProperties {
  const s: CSSProperties = {};
  if (l.x !== 50 || l.y !== 50) s.objectPosition = `${l.x}% ${l.y}%`;
  if (l.fit === "contain") s.objectFit = "contain";
  const tf = [l.zoom !== 100 && `scale(${l.zoom / 100})`, l.rot !== 0 && `rotate(${l.rot}deg)`, l.flip && "scaleX(-1)"].filter(Boolean);
  if (tf.length) { s.transform = tf.join(" "); s.transformOrigin = `${l.x}% ${l.y}%`; }
  const f = lookFilter(l);
  if (f) s.filter = f;
  return s;
}

/** Everything a page needs to show an adjusted image or video: the clean src, the style and a vignette overlay style. */
export function look(url?: string | null) {
  const l = getLook(url);
  const clean = url ? stripLook(url) : "";
  const videoSrc = clean && (l.t0 || l.t1) ? `${clean.split("#")[0]}#t=${l.t0}${l.t1 > l.t0 ? `,${l.t1}` : ""}` : clean;
  const vignette: CSSProperties | null = l.vign > 0 ? { background: `radial-gradient(ellipse at center, transparent ${70 - l.vign * 0.45}%, rgba(0,0,0,${0.25 + l.vign / 140}) 100%)` } : null;
  return { src: clean, videoSrc, style: lookStyle(l), look: l, vignette, edited: !isDefaultLook(l) };
}

/** Quick looks for the editor. */
export const lookPresets: { name: string; look: Partial<Look> }[] = [
  { name: "Original", look: { bright: 100, contrast: 100, sat: 100, gray: 0, sepia: 0, hue: 0, blur: 0, vign: 0 } },
  { name: "Vivid", look: { contrast: 115, sat: 145, bright: 104 } },
  { name: "Bright", look: { bright: 118, contrast: 104 } },
  { name: "Mono", look: { gray: 100, contrast: 112 } },
  { name: "Noir", look: { gray: 100, contrast: 150, bright: 88, vign: 55 } },
  { name: "Warm", look: { sepia: 28, sat: 120, bright: 104 } },
  { name: "Cool", look: { hue: -14, sat: 110, contrast: 106 } },
  { name: "Fade", look: { contrast: 82, sat: 80, bright: 110 } },
  { name: "Cyber", look: { hue: 160, sat: 160, contrast: 120 } },
];
