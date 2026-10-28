import Image from "next/image";
import { ImageIcon, User } from "lucide-react";
import { cn } from "@/lib/utils";

/** Shows a real image when `src` is set, otherwise a clearly labeled placeholder. */
export function ImageSlot({ src, alt, label, className, person = false, priority = false, sizes = "(max-width: 768px) 100vw, 50vw" }: { src?: string; alt: string; label: string; className?: string; person?: boolean; priority?: boolean; sizes?: string }) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const Icon = person ? User : ImageIcon;
  return (
    <div role="img" aria-label={`${label} (placeholder)`} className={cn("relative grid place-items-center overflow-hidden border border-dashed border-white/15 bg-ink-850", className)}>
      <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <Icon className="h-8 w-8 text-mist-500" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-widest text-mist-400">Placeholder</span>
        <span className="text-xs text-mist-400">{label}</span>
      </div>
    </div>
  );
}
