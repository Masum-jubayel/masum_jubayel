import { HoloFace } from "@/components/ui/HoloFace";
import type { SceneInfo } from "@/content/cms";

/** The hologram face in a glowing projector frame (About / Contact headers). */
export function HoloCard({ scene, className = "" }: { scene: SceneInfo; className?: string }) {
  const size = { small: "w-44 h-52", normal: "w-52 h-60", large: "w-60 h-72", xl: "w-72 h-80" }[scene.holoSize] ?? "w-60 h-72";
  return (
    <div className={`relative mx-auto ${size} ${className}`}>
      <div aria-hidden className="absolute inset-x-6 bottom-0 h-6 rounded-[50%] blur-md" style={{ background: `${scene.holoColor}55` }} />
      <div aria-hidden className="absolute inset-x-10 bottom-1 h-2 rounded-[50%]" style={{ background: scene.holoColor, boxShadow: `0 0 24px ${scene.holoColor}` }} />
      <div aria-hidden className="absolute bottom-2 left-1/2 h-[85%] w-[70%] -translate-x-1/2 [clip-path:polygon(50%_100%,0_0,100%_0)] opacity-[0.07]" style={{ background: `linear-gradient(to top, ${scene.holoColor}, transparent)` }} />
      <HoloFace className="relative h-full w-full" color={scene.holoColor} brightness={scene.holoBrightness} label={scene.holoLabel} sub={scene.holoSub} src={scene.holoImage} invert={scene.holoInvert} />
    </div>
  );
}
