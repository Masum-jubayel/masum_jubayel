/**
 * Customize the 3D workstation here — clothing, lighting and monitor content.
 * All values are illustrative; nothing in the scene represents a real network.
 */
export const sceneConfig = {
  character: {
    skin: "#a87a5c",
    hair: "#121214",
    shirt: "#1c2742",
    shirtAccent: "#3ee6ff",
    pants: "#1d2029",
    shoes: "#0d0f14",
    headset: true,
  },
  lighting: {
    monitorGlow: "#3ee6ff",
    rim: "#8b5cf6",
    key: "#cfe3ff",
    intensity: 1, // global multiplier
  },
  monitors: {
    /** Order of screen content across the 5 monitors: bottom-left, bottom-center, bottom-right, top-left, top-right */
    layout: ["terminal", "topology", "security", "traffic", "servers"] as ScreenKind[],
    accent: "#3ee6ff",
  },
  racks: 4,
};

export type ScreenKind = "topology" | "terminal" | "traffic" | "security" | "servers";
