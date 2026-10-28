"use client";

/* eslint-disable @next/next/no-img-element */
import type { ImgHTMLAttributes, VideoHTMLAttributes } from "react";
import { look } from "@/lib/look";

/** <img> that shows the admin's saved adjustments (focus, zoom, rotate, colour, vignette). */
export function LookImg({ src, style, alt = "", ...rest }: Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & { src: string }) {
  const f = look(src);
  return (
    <>
      <img src={f.src} alt={alt} style={{ ...f.style, ...style }} {...rest} />
      {f.vignette && <span className="pointer-events-none absolute inset-0" style={f.vignette} aria-hidden />}
    </>
  );
}

/** <video> that shows the admin's saved adjustments, including the trimmed start / end. */
export function LookVideo({ src, style, ...rest }: Omit<VideoHTMLAttributes<HTMLVideoElement>, "src"> & { src: string }) {
  const f = look(src);
  return (
    <>
      <video src={f.videoSrc} style={{ ...f.style, ...style }} {...rest}
        onTimeUpdate={f.look.t1 > f.look.t0 && rest.loop ? (e) => { const v = e.currentTarget; if (v.currentTime >= f.look.t1) v.currentTime = f.look.t0; } : rest.onTimeUpdate} />
      {f.vignette && <span className="pointer-events-none absolute inset-0" style={f.vignette} aria-hidden />}
    </>
  );
}
