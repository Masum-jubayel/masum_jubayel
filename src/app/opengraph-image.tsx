import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#04070f 0%,#0a1124 55%,#142142 100%)", color: "#e8eefc", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, border: "2px solid #3ee6ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#7ef3ff", fontSize: 22 }}>MJ</div>
          <div style={{ fontSize: 22, color: "#7d8db0", letterSpacing: 4 }}>NETWORK · INFRASTRUCTURE · SECURITY</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05 }}>Engineering Networks.</div>
          <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, color: "#3ee6ff" }}>Securing the Digital World.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 28 }}>
          <span>{site.name}</span>
          <span style={{ color: "#7ef3ff" }}>{site.title}</span>
        </div>
      </div>
    ),
    size,
  );
}
