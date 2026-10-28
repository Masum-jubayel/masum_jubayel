"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Holographic point-cloud bust of Masum, projected beside the desk. Built from the same
 * sketch "point map" as the gallery portrait; a scan band sweeps down it in a loop.
 */
const SRC = "/images/brand/pointmap.png";

const vert = /* glsl */ `
  uniform float uTime; uniform float uSize; uniform float uScan;
  attribute float aInk; attribute float aSeed;
  varying float vInk; varying float vScan;
  void main() {
    vec3 p = position;
    p.z += sin(uTime * 1.6 + aSeed * 6.28) * 0.004;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float d = abs(position.y - uScan);
    vScan = smoothstep(0.09, 0.0, d);
    vInk = aInk;
    gl_PointSize = uSize * (0.6 + aInk * 0.8 + vScan * 1.2) / -mv.z;
  }`;
const frag = /* glsl */ `
  uniform float uOpacity; uniform vec3 uColor; uniform float uGain;
  varying float vInk; varying float vScan;
  void main() {
    vec2 c = gl_PointCoord - 0.5;
    float d = dot(c, c);
    if (d > 0.25) discard;
    float soft = 1.0 - smoothstep(0.08, 0.25, d);
    vec3 base = mix(uColor * 0.7, uColor, vInk);
    vec3 col = mix(base, vec3(1.0), vScan * 0.7 + vInk * 0.15);
    gl_FragColor = vec4(col * uGain, (0.45 + vInk * 0.7 + vScan * 0.6) * uOpacity * soft);
  }`;

function useLabelTexture(label: string, sub: string, color: string) {
  return useMemo(() => {
    if (typeof document === "undefined") return null;
    const c = document.createElement("canvas");
    c.width = 512; c.height = 96;
    const x = c.getContext("2d")!;
    x.font = "600 30px 'JetBrains Mono Variable', monospace";
    x.textAlign = "center";
    x.shadowColor = color; x.shadowBlur = 12;
    x.fillStyle = color; x.fillText(label, 256, 42);
    x.font = "18px 'JetBrains Mono Variable', monospace";
    x.globalAlpha = 0.7; x.fillText(sub, 256, 76);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [label, sub, color]);
}

export function HoloPortrait({ animate, position, rotationY = 0, height = 0.9, brightness = "bright", color = "#7ef3ff", label: labelText = "MASUM JUBAYEL", sub = "IDENTITY · VERIFIED", src = SRC, invert = false }: { src?: string; invert?: boolean; animate: boolean; position: [number, number, number]; rotationY?: number; height?: number; brightness?: string; color?: string; label?: string; sub?: string }) {
  const [geo, setGeo] = useState<THREE.BufferGeometry | null>(null);
  const group = useRef<THREE.Group>(null);
  const label = useLabelTexture(labelText, sub, color);
  const gain = brightness === "max" ? 2.1 : brightness === "bright" ? 1.6 : 1.1;
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uSize: { value: 15 }, uScan: { value: 0 }, uOpacity: { value: 1 }, uColor: { value: new THREE.Color("#7ef3ff") }, uGain: { value: 1 } }), []);
  uniforms.uColor.value.set(color);
  uniforms.uGain.value = gain;
  uniforms.uSize.value = 17 + (gain - 1) * 12;

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      if (cancelled) return;
      const N = 170;
      const c = document.createElement("canvas"); c.width = N; c.height = N;
      const o = c.getContext("2d", { willReadFrequently: true })!;
      o.drawImage(img, 0, 0, N, N);
      const d = o.getImageData(0, 0, N, N).data;
      const pos: number[] = [], ink: number[] = [], seed: number[] = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i4 = (y * N + x) * 4;
        const lum = (d[i4] * 0.3 + d[i4 + 1] * 0.59 + d[i4 + 2] * 0.11) / 255;
        const v = d[i4 + 3] < 40 ? 0 : invert ? lum : 1 - lum;
        if (v < 0.16 || Math.random() > Math.min(1, v * 1.05)) continue;
        const px = (x / N - 0.5) * height, py = (0.5 - y / N) * height;
        // fake depth: bulge toward the viewer in the middle of the face
        const r = Math.hypot(px / (height * 0.5), (py - height * 0.05) / (height * 0.55));
        const pz = Math.max(0, 1 - r * r) * height * 0.18 + (Math.random() - 0.5) * 0.01;
        pos.push(px, py, pz); ink.push(v); seed.push(Math.random());
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute("aInk", new THREE.Float32BufferAttribute(ink, 1));
      g.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1));
      setGeo(g);
    };
    img.crossOrigin = "anonymous";
    img.src = src || SRC;
    return () => { cancelled = true; };
  }, [height, src, invert]);

  useEffect(() => () => geo?.dispose(), [geo]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    uniforms.uTime.value = t;
    const cycle = (t % 4.5) / 4.5;
    uniforms.uScan.value = animate ? height * 0.55 - cycle * height * 1.1 : 0;
    uniforms.uOpacity.value = animate ? 0.95 + Math.sin(t * 7) * 0.04 + (Math.random() < 0.006 ? -0.3 : 0) : 1;
    if (group.current && animate) {
      group.current.position.y = Math.sin(t * 0.9) * 0.025; // relative to the projector
      group.current.rotation.y = rotationY + Math.sin(t * 0.45) * 0.18;
    }
  });

  return (
    <group position={position}>
      <group ref={group} position={[0, 0, 0]} rotation={[0, rotationY, 0]}>
        {geo && (
          <points geometry={geo}>
            <shaderMaterial vertexShader={vert} fragmentShader={frag} uniforms={uniforms} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
          </points>
        )}
        {/* soft glow behind the face so it reads clearly against the room */}
        <mesh position={[0, 0, -0.02]}>
          <circleGeometry args={[height * 0.48, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.07 * gain} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
        </mesh>
        {label && (
          <mesh position={[0, -height * 0.62, 0]}>
            <planeGeometry args={[height * 0.9, height * 0.17]} />
            <meshBasicMaterial map={label} transparent toneMapped={false} depthWrite={false} />
          </mesh>
        )}
      </group>
      {/* projector base + light cone */}
      <mesh position={[0, -height * 0.78, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.03, 32]} />
        <meshStandardMaterial color="#0b1220" metalness={0.8} roughness={0.3} emissive="#0ea2c9" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0, -height * 0.25, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[height * 0.42, height * 1.05, 32, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0.035 * gain} side={THREE.DoubleSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  );
}
