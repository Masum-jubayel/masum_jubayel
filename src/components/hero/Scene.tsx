"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Grid, Html, Line, RoundedBox, useGLTF } from "@react-three/drei";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { drawers, SCREEN_H, SCREEN_W } from "./screens";
import { sceneConfig, type ScreenKind } from "./sceneConfig";
import { HoloPortrait } from "./HoloPortrait";
import { defaultScene, type SceneInfo } from "@/content/cms";

/** Masum's MJ banner mounted as a glowing wall display behind the workstation. */
function WallBanner({ src, opacity = 0.28, size = "normal" }: { src: string; opacity?: number; size?: string }) {
  const [aspect, setAspect] = useState(563 / 1000);
  const tex = useMemo(() => {
    const t = new THREE.TextureLoader().load(src, (tx) => { const im = tx.image as { width?: number; height?: number }; if (im?.width && im?.height) setAspect(im.height / im.width); });
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, [src]);
  useEffect(() => () => tex.dispose(), [tex]);
  const w = size === "small" ? 2.4 : size === "large" ? 3.6 : 3.1, h = Math.min(w * aspect, 1.9);
  return (
    <group position={[-0.15, 1.95, -1.74]}>
      <mesh position={[0, 0, -0.01]}>
        <planeGeometry args={[w + 0.08, h + 0.08]} />
        <meshBasicMaterial color="#0b1222" toneMapped={false} transparent opacity={0.5} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} toneMapped={false} fog={false} transparent opacity={opacity} />
      </mesh>
      {[[-1, 0], [1, 0]].map(([sx]) => (
        <mesh key={sx} position={[sx * (w / 2 + 0.045), 0, 0]}>
          <boxGeometry args={[0.012, h + 0.08, 0.01]} />
          <meshBasicMaterial color={sx < 0 ? "#22c55e" : "#ef4444"} toneMapped={false} transparent opacity={0.35} />
        </mesh>
      ))}
      <pointLight position={[0, 0, 0.6]} intensity={0.8} distance={3} color="#7ef3ff" />
    </group>
  );
}

export type Tier = "high" | "low";

type Props = { tier: Tier; animate: boolean; active: boolean; characterModelUrl?: string; onReady?: () => void; onNavigate?: (href: string) => void; onInteract?: () => void; settings?: SceneInfo; hologram?: boolean };

const cfg = sceneConfig;

/** Pointer state over the canvas (normalized -1..1). Drives the stronger hover parallax. */
const hover = { x: 0, y: 0, active: false };
/** Interaction state shared across the scene: hovered monitor, packet burst and chair spin timers. */
const ix = { monitor: -1, burstUntil: 0, spinStart: -10, rackHot: false, now: 0, enabled: true };
const setCursor = (on: boolean) => { if (typeof document !== "undefined") document.body.style.cursor = on ? "pointer" : ""; };

/** What each screen links to. */
let SCREEN_LINKS: Record<ScreenKind, { label: string; hint: string; href: string }> = {
  topology: { label: "Network topology", hint: "Open projects", href: "/projects" },
  terminal: { label: "Terminal & scripts", hint: "Read the blog", href: "/blog" },
  security: { label: "Security monitor", hint: "See certifications", href: "/achievements#certs" },
  traffic: { label: "Traffic & uptime", hint: "View experience", href: "/experience" },
  servers: { label: "Systems status", hint: "Explore skills", href: "/skills" },
};

/** Small floating label used for hover / click feedback. */
function Bubble({ children, tone = "#3ee6ff" }: { children: ReactNode; tone?: string }) {
  return (
    <div style={{ pointerEvents: "none", whiteSpace: "nowrap", transform: "translateY(-100%)", padding: "6px 10px", borderRadius: 10, border: `1px solid ${tone}88`, background: "rgba(4,7,15,0.88)", color: "#e8f1ff", font: "600 11px/1.3 ui-sans-serif, system-ui", boxShadow: `0 0 18px ${tone}55`, backdropFilter: "blur(6px)" }}>
      {children}
    </div>
  );
}

/* ---------------------------------- helpers ---------------------------------- */

const UP = new THREE.Vector3(0, 1, 0);
/** A capsule stretched between two points — used for limbs. */
function Limb({ from, to, r, color }: { from: [number, number, number]; to: [number, number, number]; r: number; color: string }) {
  const { pos, quat, len } = useMemo(() => {
    const a = new THREE.Vector3(...from), b = new THREE.Vector3(...to);
    const dir = b.clone().sub(a);
    const len = dir.length();
    const q = new THREE.Quaternion().setFromUnitVectors(UP, dir.normalize());
    return { pos: a.add(b).multiplyScalar(0.5), quat: q, len };
  }, [from, to]);
  return (
    <mesh position={pos} quaternion={quat} castShadow>
      <capsuleGeometry args={[r, Math.max(0.001, len - r * 0.6), 6, 12]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
}

/* ---------------------------------- character ---------------------------------- */

function Engineer({ animate }: { animate: boolean }) {
  const c = cfg.character;
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const handL = useRef<THREE.Mesh>(null);
  const handR = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    if (torso.current) torso.current.scale.set(1, 1 + Math.sin(t * 1.6) * 0.012, 1 + Math.sin(t * 1.6) * 0.015);
    if (head.current) {
      // glance between screens
      const glance = Math.sin(t * 0.35) * 0.32 + Math.sin(t * 0.9) * 0.05;
      const m = ix.monitor >= 0 ? MONITORS[ix.monitor] : null;
      const yaw = m ? -m.pos[0] * 0.75 : hover.active ? hover.x * 0.55 : glance;
      head.current.rotation.y = THREE.MathUtils.lerp(head.current.rotation.y, yaw, 0.1);
      head.current.rotation.x = THREE.MathUtils.lerp(head.current.rotation.x, m && m.pos[1] > 1.3 ? 0.22 : -0.12 + Math.sin(t * 0.5) * 0.04, 0.1);
    }
    const f = t < ix.burstUntil ? 2.2 : 1;
    if (handL.current) handL.current.position.y = 0.785 + Math.max(0, Math.sin(t * 13 * f)) * 0.012 * f;
    if (handR.current) handR.current.position.y = 0.785 + Math.max(0, Math.sin(t * 11 * f + 1.3)) * 0.012 * f;
  });

  return (
    <group>
      {/* torso */}
      <group ref={torso} position={[0, 0.6, 0.8]}>
        <mesh position={[0, 0.27, -0.03]} rotation={[-0.16, 0, 0]} castShadow>
          <capsuleGeometry args={[0.165, 0.34, 8, 16]} />
          <meshStandardMaterial color={c.shirt} roughness={0.85} />
        </mesh>
        {/* collar accent */}
        <mesh position={[0, 0.5, -0.1]} rotation={[-0.4, 0, 0]}>
          <torusGeometry args={[0.07, 0.012, 8, 24]} />
          <meshStandardMaterial color={c.shirtAccent} emissive={c.shirtAccent} emissiveIntensity={0.25} roughness={0.4} />
        </mesh>
      </group>
      {/* neck + head */}
      <mesh position={[0, 1.15, 0.69]} castShadow>
        <cylinderGeometry args={[0.045, 0.05, 0.1, 12]} />
        <meshStandardMaterial color={c.skin} roughness={0.6} />
      </mesh>
      <group ref={head} position={[0, 1.27, 0.66]}>
        <mesh scale={[0.92, 1.08, 1]} castShadow>
          <sphereGeometry args={[0.105, 24, 24]} />
          <meshStandardMaterial color={c.skin} roughness={0.55} />
        </mesh>
        {/* hair */}
        <mesh position={[0, 0.03, 0.012]} scale={[0.98, 0.95, 1.02]}>
          <sphereGeometry args={[0.108, 24, 24, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={c.hair} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.005, 0.04]} scale={[0.96, 0.85, 0.85]}>
          <sphereGeometry args={[0.105, 20, 20]} />
          <meshStandardMaterial color={c.hair} roughness={0.9} />
        </mesh>
        {/* ears */}
        {[-1, 1].map((s) => (
          <mesh key={s} position={[s * 0.097, -0.005, 0.0]} scale={[0.4, 1, 0.7]}>
            <sphereGeometry args={[0.026, 10, 10]} />
            <meshStandardMaterial color={c.skin} roughness={0.6} />
          </mesh>
        ))}
        {c.headset && (
          <group>
            <mesh rotation={[0, Math.PI / 2, 0]} position={[0, 0.01, 0]}>
              <torusGeometry args={[0.115, 0.009, 8, 32, Math.PI]} />
              <meshStandardMaterial color="#1a1f2b" metalness={0.6} roughness={0.35} />
            </mesh>
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.112, -0.01, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.034, 0.034, 0.024, 20]} />
                <meshStandardMaterial color="#141822" metalness={0.5} roughness={0.4} emissive={cfg.lighting.monitorGlow} emissiveIntensity={0.06} />
              </mesh>
            ))}
            <Limb from={[-0.115, -0.03, 0]} to={[-0.07, -0.08, -0.08]} r={0.005} color="#141822" />
          </group>
        )}
      </group>
      {/* arms */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.195, 1.04, 0.71]} castShadow>
            <sphereGeometry args={[0.062, 14, 14]} />
            <meshStandardMaterial color={c.shirt} roughness={0.85} />
          </mesh>
          <Limb from={[s * 0.2, 1.03, 0.71]} to={[s * 0.25, 0.85, 0.53]} r={0.052} color={c.shirt} />
          <Limb from={[s * 0.25, 0.85, 0.53]} to={[s * 0.165, 0.8, 0.24]} r={0.038} color={c.skin} />
        </group>
      ))}
      <mesh ref={handL} position={[-0.15, 0.785, 0.2]} scale={[1, 0.5, 1.3]} castShadow>
        <sphereGeometry args={[0.036, 12, 12]} />
        <meshStandardMaterial color={c.skin} roughness={0.6} />
      </mesh>
      <mesh ref={handR} position={[0.15, 0.785, 0.2]} scale={[1, 0.5, 1.3]} castShadow>
        <sphereGeometry args={[0.036, 12, 12]} />
        <meshStandardMaterial color={c.skin} roughness={0.6} />
      </mesh>
      {/* legs */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Limb from={[s * 0.1, 0.56, 0.82]} to={[s * 0.12, 0.56, 0.4]} r={0.075} color={c.pants} />
          <Limb from={[s * 0.12, 0.54, 0.4]} to={[s * 0.12, 0.1, 0.44]} r={0.058} color={c.pants} />
          <RoundedBox args={[0.1, 0.07, 0.24]} radius={0.03} position={[s * 0.12, 0.04, 0.38]} castShadow>
            <meshStandardMaterial color={c.shoes} roughness={0.5} />
          </RoundedBox>
        </group>
      ))}
    </group>
  );
}

/** Optional external character model (GLB) — positioned to sit in the chair. */
function GLBCharacter({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} position={[0, 0, 0.8]} rotation={[0, Math.PI, 0]} />;
}

class ModelBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

/* ---------------------------------- furniture ---------------------------------- */

function Chair() {
  const m = <meshStandardMaterial color="#141a28" roughness={0.6} metalness={0.2} />;
  return (
    <group position={[0, 0, 0.86]}>
      <RoundedBox args={[0.5, 0.08, 0.48]} radius={0.03} position={[0, 0.47, 0]} castShadow>{m}</RoundedBox>
      <RoundedBox args={[0.46, 0.62, 0.07]} radius={0.03} position={[0, 0.84, 0.25]} rotation={[0.12, 0, 0]} castShadow>{m}</RoundedBox>
      <mesh position={[0, 0.25, 0]}><cylinderGeometry args={[0.03, 0.03, 0.42, 10]} /><meshStandardMaterial color="#2a3346" metalness={0.8} roughness={0.3} /></mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos((i / 5) * Math.PI * 2) * 0.17, 0.05, Math.sin((i / 5) * Math.PI * 2) * 0.17]} rotation={[0, -(i / 5) * Math.PI * 2, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.34, 8]} />
          <meshStandardMaterial color="#2a3346" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

function Desk({ showSwitch = true }: { showSwitch?: boolean }) {
  return (
    <group>
      <RoundedBox args={[2.5, 0.05, 0.95]} radius={0.015} position={[0, 0.74, -0.05]} receiveShadow castShadow>
        <meshStandardMaterial color="#0f1626" roughness={0.35} metalness={0.4} />
      </RoundedBox>
      {/* glowing front edge */}
      <mesh position={[0, 0.738, 0.428]}>
        <boxGeometry args={[2.5, 0.006, 0.006]} />
        <meshBasicMaterial color={cfg.lighting.monitorGlow} toneMapped={false} />
      </mesh>
      {[-1.15, 1.15].map((x) => (
        <mesh key={x} position={[x, 0.36, -0.05]} castShadow>
          <boxGeometry args={[0.06, 0.72, 0.85]} />
          <meshStandardMaterial color="#121a2c" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* keyboard */}
      <RoundedBox args={[0.46, 0.022, 0.15]} radius={0.008} position={[0, 0.775, 0.17]}>
        <meshStandardMaterial color="#1a2234" roughness={0.5} emissive="#0c3a52" emissiveIntensity={0.4} />
      </RoundedBox>
      {/* mouse */}
      <mesh position={[0.38, 0.775, 0.2]} scale={[1, 0.45, 1.5]}>
        <sphereGeometry args={[0.035, 14, 14]} />
        <meshStandardMaterial color="#1a2234" roughness={0.4} />
      </mesh>
      {/* mug */}
      <mesh position={[-0.6, 0.82, 0.18]}>
        <cylinderGeometry args={[0.04, 0.036, 0.1, 16]} />
        <meshStandardMaterial color="#d8e2f5" roughness={0.4} />
      </mesh>
      {showSwitch && <DeskSwitch />}
    </group>
  );
}

/** Desk switch — click it to fire a burst of packets across the network. */
function DeskSwitch() {
  const [hot, setHot] = useState(false);
  const [burst, setBurst] = useState(false);
  const leds = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const colors = useMemo(() => [new THREE.Color("#34d399"), new THREE.Color("#3ee6ff"), new THREE.Color("#fbbf24"), new THREE.Color("#0b1220")], []);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const fast = t < ix.burstUntil;
    leds.current.forEach((m, i) => {
      if (!m) return;
      const on = fast ? Math.sin(t * 40 + i * 2.1) > 0 : Math.sin(t * 3 + i * 1.7) > -0.6;
      m.color.copy(on ? colors[i % 3 ? 0 : 1] : colors[3]);
    });
  });
  const fire = () => {
    ix.burstUntil = ix.now + 2.6;
    setBurst(true);
    window.setTimeout(() => setBurst(false), 1800);
  };
  return (
    <group position={[0.82, 0.785, 0.12]}
      onPointerOver={(e) => { if (!ix.enabled) return; e.stopPropagation(); setHot(true); setCursor(true); }}
      onPointerOut={() => { setHot(false); setCursor(false); }}
      onClick={(e) => { if (!ix.enabled) return; e.stopPropagation(); fire(); }}>
      <mesh scale={hot ? 1.06 : 1}>
        <boxGeometry args={[0.32, 0.04, 0.16]} />
        <meshStandardMaterial color="#1b2436" metalness={0.6} roughness={0.35} emissive={hot ? "#0e4a63" : "#000000"} />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh key={i} position={[-0.13 + i * 0.036, 0.005, 0.081]}>
          <boxGeometry args={[0.012, 0.008, 0.002]} />
          <meshBasicMaterial ref={(m) => { leds.current[i] = m; }} color="#34d399" toneMapped={false} />
        </mesh>
      ))}
      {(hot || burst) && (
        <Html position={[0, 0.08, 0]} center zIndexRange={[20, 0]}>
          <Bubble tone="#34d399">{burst ? "Packet burst sent!" : "Click: send packets"}</Bubble>
        </Html>
      )}
    </group>
  );
}

/* ---------------------------------- monitors ---------------------------------- */

type ScreenTex = { kind: ScreenKind; canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; tex: THREE.CanvasTexture };

function useScreens(kinds: ScreenKind[], tier: Tier) {
  return useMemo<ScreenTex[]>(() => {
    const scale = tier === "high" ? 1 : 0.7;
    return kinds.map((kind) => {
      const canvas = document.createElement("canvas");
      canvas.width = SCREEN_W * scale;
      canvas.height = SCREEN_H * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 4;
      return { kind, canvas, ctx, tex };
    });
  }, [kinds, tier]);
}

const MONITORS: { pos: [number, number, number]; rotY: number; size: [number, number] }[] = [
  { pos: [-0.7, 1.03, -0.2], rotY: 0.42, size: [0.66, 0.4] },
  { pos: [0, 1.03, -0.34], rotY: 0, size: [0.72, 0.43] },
  { pos: [0.7, 1.03, -0.2], rotY: -0.42, size: [0.66, 0.4] },
  { pos: [-0.37, 1.5, -0.32], rotY: 0.16, size: [0.66, 0.4] },
  { pos: [0.37, 1.5, -0.32], rotY: -0.16, size: [0.66, 0.4] },
];

function Monitors({ tier, animate, onNavigate }: { tier: Tier; animate: boolean; onNavigate?: (href: string) => void }) {
  const screens = useScreens(cfg.monitors.layout, tier);
  const [hovered, setHovered] = useState(-1);
  const groups = useRef<(THREE.Group | null)[]>([]);
  const frames = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const acc = useRef(0);
  const turn = useRef(0);
  const invalidate = useThree((s) => s.invalidate);

  useEffect(() => {
    // initial paint for all screens (also covers reduced-motion static render)
    screens.forEach((s) => { drawers[s.kind](s.ctx, 3.2); s.tex.needsUpdate = true; });
    invalidate();
    return () => screens.forEach((s) => s.tex.dispose());
  }, [screens, invalidate]);

  useFrame(({ clock }, dt) => {
    // hover: monitor eases forward and its bezel glows
    MONITORS.forEach((m, i) => {
      const g = groups.current[i];
      if (!g) return;
      const on = hovered === i;
      const sc = THREE.MathUtils.lerp(g.scale.x, on ? 1.12 : 1, 0.15);
      g.scale.setScalar(sc);
      const fwd = on ? 0.08 : 0;
      const dir = new THREE.Vector3(Math.sin(m.rotY), 0, Math.cos(m.rotY)).multiplyScalar(fwd);
      g.position.lerp(new THREE.Vector3(m.pos[0] + dir.x, m.pos[1] + dir.y, m.pos[2] + dir.z), 0.15);
      const f = frames.current[i];
      if (f) f.emissiveIntensity = THREE.MathUtils.lerp(f.emissiveIntensity, on ? 1.6 : 0, 0.15);
    });
    if (!animate) return;
    acc.current += dt;
    const interval = tier === "high" ? 0.06 : 0.12;
    if (acc.current < interval) return;
    acc.current = 0;
    const s = screens[turn.current % screens.length];
    turn.current++;
    drawers[s.kind](s.ctx, clock.elapsedTime);
    s.tex.needsUpdate = true;
  });

  return (
    <group>
      {MONITORS.map((m, i) => (
        <group key={i} ref={(g) => { groups.current[i] = g; }} position={m.pos} rotation={[i > 2 ? 0.08 : 0, m.rotY, 0]}
          onPointerOver={(e) => { if (!ix.enabled) return; e.stopPropagation(); setHovered(i); ix.monitor = i; setCursor(true); }}
          onPointerOut={() => { setHovered((h) => (h === i ? -1 : h)); if (ix.monitor === i) ix.monitor = -1; setCursor(false); }}
          onClick={(e) => { if (!ix.enabled) return; e.stopPropagation(); setCursor(false); onNavigate?.(SCREEN_LINKS[screens[i].kind].href); }}>
          <RoundedBox args={[m.size[0] + 0.03, m.size[1] + 0.03, 0.025]} radius={0.01} castShadow>
            <meshStandardMaterial ref={(mat) => { frames.current[i] = mat; }} color="#0b0f19" metalness={0.6} roughness={0.3} emissive={cfg.lighting.monitorGlow} emissiveIntensity={0} />
          </RoundedBox>
          {hovered === i && (
            <Html position={[0, m.size[1] / 2 + 0.04, 0.02]} center zIndexRange={[20, 0]}>
              <Bubble>{SCREEN_LINKS[screens[i].kind].label} <span style={{ color: "#7ef3ff" }}>· {SCREEN_LINKS[screens[i].kind].hint} →</span></Bubble>
            </Html>
          )}
          <mesh position={[0, 0, 0.0135]}>
            <planeGeometry args={m.size} />
            <meshBasicMaterial map={screens[i].tex} toneMapped={false} />
          </mesh>
          {/* stand */}
          {i < 3 && (
            <>
              <mesh position={[0, -0.25, -0.03]}><boxGeometry args={[0.04, 0.16, 0.02]} /><meshStandardMaterial color="#1b2234" metalness={0.7} roughness={0.3} /></mesh>
              <mesh position={[0, -0.33, 0]}><boxGeometry args={[0.2, 0.012, 0.13]} /><meshStandardMaterial color="#1b2234" metalness={0.7} roughness={0.3} /></mesh>
            </>
          )}
        </group>
      ))}
      {/* upper-monitor arm */}
      <mesh position={[0, 1.27, -0.42]}><boxGeometry args={[0.04, 0.55, 0.04]} /><meshStandardMaterial color="#1b2234" metalness={0.7} roughness={0.3} /></mesh>
    </group>
  );
}

/* ---------------------------------- racks ---------------------------------- */

function Racks({ tier, animate }: { tier: Tier; animate: boolean }) {
  const count = tier === "high" ? cfg.racks : Math.min(3, cfg.racks);
  const ledsPerRack = 36;
  const ref = useRef<THREE.InstancedMesh>(null);
  const acc = useRef(0);
  const palette = useMemo(() => [new THREE.Color("#34d399"), new THREE.Color("#3ee6ff"), new THREE.Color("#4f8cff"), new THREE.Color("#fbbf24"), new THREE.Color("#0b1220")], []);
  const rackX = useMemo(() => Array.from({ length: count }, (_, i) => (i - (count - 1) / 2) * 0.78), [count]);

  useEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    const m = new THREE.Matrix4();
    let k = 0;
    rackX.forEach((x) => {
      for (let u = 0; u < ledsPerRack; u++) {
        const row = Math.floor(u / 3), col = u % 3;
        m.setPosition(x - 0.2 + col * 0.05, 0.35 + row * 0.14, -1.79);
        mesh.setMatrixAt(k, m);
        mesh.setColorAt(k, palette[(k * 7) % 4]);
        k++;
      }
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [rackX, palette]);

  useFrame((_, dt) => {
    if (!animate || !ref.current) return;
    acc.current += dt;
    const hot = ix.rackHot || ix.now < ix.burstUntil;
    if (acc.current < (hot ? 0.05 : 0.18)) return;
    acc.current = 0;
    const mesh = ref.current;
    for (let n = 0; n < (hot ? 40 : 10); n++) {
      const i = Math.floor(Math.random() * mesh.count);
      mesh.setColorAt(i, Math.random() < 0.3 ? palette[4] : palette[Math.floor(Math.random() * 4)]);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  });

  const [hot, setHot] = useState(false);
  return (
    <group onPointerOver={(e) => { if (!ix.enabled) return; e.stopPropagation(); ix.rackHot = true; setHot(true); }} onPointerOut={() => { ix.rackHot = false; setHot(false); }}>
      {hot && (
        <Html position={[rackX[rackX.length - 1] ?? 0, 2.25, -1.8]} center zIndexRange={[20, 0]}>
          <Bubble tone="#4f8cff">Server racks · all systems up</Bubble>
        </Html>
      )}
      {rackX.map((x) => (
        <group key={x}>
          <mesh position={[x, 1.05, -2.2]} castShadow receiveShadow>
            <boxGeometry args={[0.66, 2.1, 0.8]} />
            <meshStandardMaterial color="#0a0f1c" metalness={0.6} roughness={0.45} />
          </mesh>
          {/* rack units */}
          {Array.from({ length: 12 }).map((_, u) => (
            <mesh key={u} position={[x, 0.35 + u * 0.14, -1.8]}>
              <boxGeometry args={[0.58, 0.1, 0.01]} />
              <meshStandardMaterial color={u % 4 === 0 ? "#18233a" : "#111a2c"} metalness={0.7} roughness={0.35} />
            </mesh>
          ))}
          {/* vertical light strip */}
          <mesh position={[x + 0.31, 1.05, -1.795]}>
            <boxGeometry args={[0.008, 1.9, 0.004]} />
            <meshBasicMaterial color={cfg.lighting.monitorGlow} transparent opacity={0.5} toneMapped={false} />
          </mesh>
        </group>
      ))}
      <instancedMesh ref={ref} args={[undefined, undefined, rackX.length * ledsPerRack]}>
        <boxGeometry args={[0.022, 0.014, 0.004]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
    </group>
  );
}

/* ---------------------------------- network paths + packets ---------------------------------- */

function NetworkPaths({ animate, tier }: { animate: boolean; tier: Tier }) {
  const curves = useMemo(() => {
    const pts: [number, number, number][][] = [
      [[-1.17, 2.1, -1.9], [-1.0, 2.55, -1.2], [-0.4, 2.35, -0.6], [0, 1.8, -0.45]],
      [[1.17, 2.1, -1.9], [1.0, 2.6, -1.1], [0.4, 2.35, -0.6], [0, 1.8, -0.45]],
      [[-0.39, 2.1, -1.9], [-0.3, 2.45, -1.4], [0.3, 2.45, -1.4], [0.39, 2.1, -1.9]],
      [[0.39, 2.1, -1.9], [0.9, 2.3, -0.9], [1.2, 1.4, -0.2], [0.82, 0.8, 0.12]],
      [[-1.17, 2.1, -1.9], [-1.7, 2.2, -0.8], [-1.6, 1.4, 0.2], [-1.25, 0.76, 0.1]],
    ];
    return pts.map((p) => new THREE.CatmullRomCurve3(p.map((v) => new THREE.Vector3(...v))));
  }, []);
  const linePts = useMemo(() => curves.map((c) => c.getPoints(48)), [curves]);
  const perCurve = tier === "high" ? 3 : 2;
  const packets = useRef<(THREE.Mesh | null)[]>([]);

  const prog = useRef(0);
  useFrame(({ clock }, dt) => {
    const t = clock.elapsedTime;
    ix.now = t;
    const burst = t < ix.burstUntil;
    prog.current += dt * (burst ? 0.75 : 0.16);
    packets.current.forEach((m, i) => {
      if (!m) return;
      const ci = Math.floor(i / perCurve);
      const p = animate ? (prog.current + (i % perCurve) / perCurve + ci * 0.13) % 1 : (i % perCurve) / perCurve + 0.15;
      m.position.copy(curves[ci].getPointAt(p % 1));
      m.scale.setScalar(THREE.MathUtils.lerp(m.scale.x, burst ? 1.9 : 1, 0.1));
    });
  });

  return (
    <group>
      {linePts.map((pts, i) => (
        <Line key={i} points={pts} color={i % 2 ? "#8b5cf6" : cfg.lighting.monitorGlow} lineWidth={1.2} transparent opacity={0.35} />
      ))}
      {curves.flatMap((_, ci) =>
        Array.from({ length: perCurve }).map((__, k) => (
          <mesh key={`${ci}-${k}`} ref={(el) => { packets.current[ci * perCurve + k] = el; }}>
            <sphereGeometry args={[0.018, 10, 10]} />
            <meshBasicMaterial color={ci % 2 ? "#c4b5fd" : "#7ef3ff"} toneMapped={false} />
          </mesh>
        )),
      )}
    </group>
  );
}

/* ---------------------------------- camera rig ---------------------------------- */

function Rig({ animate }: { animate: boolean }) {
  const { camera, size, pointer } = useThree();
  const narrow = size.width < 640;
  const base = useMemo(() => (narrow ? new THREE.Vector3(2.5, 1.9, 3.5) : new THREE.Vector3(2.0, 1.7, 2.65)), [narrow]);
  const target = useMemo(() => new THREE.Vector3(-0.1, 1.0, -0.3), []);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    camera.position.copy(base);
    camera.lookAt(target);
  }, [camera, base, target]);

  const offset = useMemo(() => base.clone().sub(target), [base, target]);
  const sph = useMemo(() => new THREE.Spherical().setFromVector3(offset), [offset]);
  const cur = useRef({ theta: 0, phi: 0, zoom: 0 });

  useFrame(({ clock }) => {
    if (!animate) return;
    const t = clock.elapsedTime;
    // Idle: slow drift. Hovering: orbit noticeably toward the pointer and lean in.
    const goalTheta = hover.active ? hover.x * 0.55 : Math.sin(t * 0.15) * 0.05;
    const goalPhi = hover.active ? -hover.y * 0.22 : 0;
    const goalZoom = ix.monitor >= 0 ? -0.6 : hover.active ? -0.35 : 0;
    const k = hover.active ? 0.06 : 0.03;
    cur.current.theta += (goalTheta - cur.current.theta) * k;
    cur.current.phi += (goalPhi - cur.current.phi) * k;
    cur.current.zoom += (goalZoom - cur.current.zoom) * k;
    const s2 = new THREE.Spherical(sph.radius + cur.current.zoom, THREE.MathUtils.clamp(sph.phi + cur.current.phi, 0.6, 1.45), sph.theta + cur.current.theta);
    tmp.setFromSpherical(s2).add(target);
    camera.position.copy(tmp);
    camera.lookAt(target);
  });
  void pointer;
  return null;
}

function Ready({ onReady }: { onReady?: () => void }) {
  useEffect(() => { onReady?.(); }, [onReady]);
  return null;
}

/* ---------------------------------- scene ---------------------------------- */

/** Chair + engineer: click to spin the chair round and say hello. */
function Seat({ children, onInteract }: { children: ReactNode; onInteract?: () => void }) {
  const g = useRef<THREE.Group>(null);
  const [hot, setHot] = useState(false);
  const [hello, setHello] = useState(false);
  useFrame(({ clock }) => {
    if (!g.current) return;
    const k = (clock.elapsedTime - ix.spinStart) / 1.4;
    g.current.rotation.y = k >= 0 && k <= 1 ? (1 - Math.pow(1 - k, 3)) * Math.PI * 2 : 0;
    g.current.position.y = k >= 0 && k <= 1 ? Math.sin(k * Math.PI) * 0.05 : 0;
  });
  return (
    <group>
      <group ref={g} position={[0, 0, 0.86]}>
        <group position={[0, 0, -0.86]}
          onPointerOver={(e) => { if (!ix.enabled) return; e.stopPropagation(); setHot(true); setCursor(true); }}
          onPointerOut={() => { setHot(false); setCursor(false); }}
          onClick={(e) => { if (!ix.enabled) return; e.stopPropagation(); ix.spinStart = ix.now; onInteract?.(); setHello(true); window.setTimeout(() => setHello(false), 3200); }}>
          {children}
        </group>
      </group>
      {(hot || hello) && (
        <Html position={[0.05, 1.55, 0.7]} center zIndexRange={[20, 0]}>
          <Bubble tone="#a78bfa">{hello ? "Hi, I'm Masum! Click a screen to explore." : "Click me"}</Bubble>
        </Html>
      )}
    </group>
  );
}

export default function Scene({ tier, animate, active, characterModelUrl, onReady, onNavigate, onInteract, settings = defaultScene, hologram = true }: Props) {
  // Admin → 3D scene & hologram: colours, lighting, links and behaviour.
  Object.assign(cfg.character, { shirt: settings.shirt, shirtAccent: settings.shirtAccent, skin: settings.skin, hair: settings.hair, pants: settings.pants });
  Object.assign(cfg.lighting, { monitorGlow: settings.glow, rim: settings.rim, intensity: Number(settings.light) || 1 });
  ix.enabled = settings.interactive;
  SCREEN_LINKS = { ...SCREEN_LINKS, ...Object.fromEntries(settings.screens.filter((x) => x.href).map((x) => [x.kind, { label: x.label, hint: x.hint, href: x.href }])) };
  const holoH = { small: 0.6, normal: 0.72, large: 0.85, xl: 1.0 }[settings.holoSize as "small"] ?? 0.85;
  const L = cfg.lighting;
  const shadows = tier === "high";
  return (
    <Canvas
      shadows={shadows}
      dpr={tier === "high" ? [1, 1.75] : [1, 1.25]}
      frameloop={!active ? "never" : animate ? "always" : "demand"}
      camera={{ fov: 38, near: 0.1, far: 30, position: [2.05, 1.72, 2.75] }}
      gl={{ antialias: tier === "high", powerPreference: "high-performance", alpha: true }}
      onPointerMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        hover.x = ((e.clientX - r.left) / r.width) * 2 - 1;
        hover.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
        hover.active = settings.cameraMotion && e.pointerType === "mouse";
      }}
      onPointerLeave={() => { hover.active = false; }}
      aria-hidden
    >
      <fog attach="fog" args={["#04070f", 4.2, 10]} />
      <ambientLight intensity={0.35 * L.intensity} color="#8fb4ff" />
      <hemisphereLight args={["#3b5aa8", "#04070f", 0.5 * L.intensity]} />
      <spotLight
        position={[1.6, 3.6, 2.4]}
        angle={0.5}
        penumbra={0.7}
        intensity={34 * L.intensity}
        color={L.key}
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      <pointLight position={[2.2, 2.0, 2.4]} intensity={4 * L.intensity} distance={6} color="#9fc2ff" />
      <pointLight position={[0, 1.15, 0.05]} intensity={2.6 * L.intensity} distance={3} color={L.monitorGlow} />
      <pointLight position={[0, 1.6, 0]} intensity={1.4 * L.intensity} distance={2.5} color="#4f8cff" />
      <pointLight position={[-2.2, 2.2, -1.2]} intensity={5 * L.intensity} distance={6} color={L.rim} />
      <pointLight position={[2.4, 1.4, -1]} intensity={3 * L.intensity} distance={5} color={L.monitorGlow} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#050a16" roughness={0.55} metalness={0.5} />
      </mesh>
      <Grid
        position={[0, 0.002, 0]}
        args={[20, 20]}
        cellSize={0.4}
        cellThickness={0.6}
        cellColor="#0f2a48"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#145a7a"
        fadeDistance={9}
        fadeStrength={1.5}
        infiniteGrid
      />
      {/* back wall */}
      <mesh position={[0, 2, -2.7]}>
        <planeGeometry args={[12, 5]} />
        <meshStandardMaterial color="#060c1c" roughness={0.9} />
      </mesh>

      <Desk showSwitch={settings.showDeskSwitch} />
      <Seat onInteract={onInteract}>
        <Chair />
        {characterModelUrl ? (
          <ModelBoundary fallback={<Engineer animate={animate} />}>
            <Suspense fallback={<Engineer animate={animate} />}>
              <GLBCharacter url={characterModelUrl} />
            </Suspense>
          </ModelBoundary>
        ) : (
          <Engineer animate={animate} />
        )}
      </Seat>
      <Monitors tier={tier} animate={animate} onNavigate={(h) => { onInteract?.(); onNavigate?.(h); }} />
      {settings.showRacks && <Racks tier={tier} animate={animate} />}
      <group onClick={(e) => { if (!ix.enabled) return; e.stopPropagation(); onNavigate?.("/gallery"); }} onPointerOver={(e) => { if (!ix.enabled) return; e.stopPropagation(); setCursor(true); }} onPointerOut={() => setCursor(false)}>
        {settings.showBanner && <WallBanner src={settings.bannerImage || "/images/brand/logo-banner.jpg"} opacity={Number(settings.bannerOpacity) || 0.28} size={settings.bannerWidth} />}
      </group>
      {settings.showPaths && <NetworkPaths animate={animate} tier={tier} />}
      {hologram && (
        <group onClick={(e) => { if (!ix.enabled) return; e.stopPropagation(); setCursor(false); onNavigate?.("/about"); }} onPointerOver={(e) => { if (!ix.enabled) return; e.stopPropagation(); setCursor(true); }} onPointerOut={() => setCursor(false)}>
          <HoloPortrait src={settings.holoImage} invert={settings.holoInvert} animate={animate} position={[-1.45, 1.62, -0.7]} rotationY={0.6} height={holoH} brightness={settings.holoBrightness} color={settings.holoColor} label={settings.holoLabel} sub={settings.holoSub} />
        </group>
      )}
      <Rig animate={animate} />
      <Ready onReady={onReady} />
    </Canvas>
  );
}
