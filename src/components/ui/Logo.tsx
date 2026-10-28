/* eslint-disable @next/next/no-img-element */
/**
 * Brand marks, cut from Masum's MJ banner artwork (portrait, green "Masum", red "Jubayel",
 * neon MJ triangle with circuit traces). Source: /public/images/brand/logo-banner.jpg.
 */
const GREEN = "#22c55e";
const RED = "#ef4444";

/** Compact mark for the navbar: portrait + MJ triangle. */
export function Logo({ className = "h-12 w-auto", title = "Masum Jubayel" }: { className?: string; title?: string }) {
  return (
    <img
      src="/images/brand/logo-mark.png"
      alt={title}
      width={260}
      height={359}
      className={`rounded-lg object-cover ring-1 ring-white/10 shadow-[0_0_18px_-4px_rgba(34,197,94,0.55),0_0_18px_-6px_rgba(239,68,68,0.5)] ${className}`}
    />
  );
}

/** Script wordmark: "Masum" in green, "Jubayel" in red. */
export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-script leading-none ${className}`}>
      <span style={{ color: GREEN }}>Masum</span> <span style={{ color: RED }}>Jubayel</span>
    </span>
  );
}

/** Full banner logo (footer). */
export function LogoEmblem({ className = "w-72", title = "Masum Jubayel — MJ logo" }: { className?: string; title?: string }) {
  return (
    <img
      src="/images/brand/logo-banner.jpg"
      alt={title}
      width={1000}
      height={563}
      loading="lazy"
      className={`rounded-2xl ring-1 ring-white/10 shadow-[0_10px_40px_-12px_rgba(34,197,94,0.45),0_10px_40px_-12px_rgba(239,68,68,0.4)] ${className}`}
    />
  );
}
