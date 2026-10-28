import type { Heading } from "@/content/cms";

/** Renders an admin-editable heading: plain title followed by the highlighted (gradient) words. */
export function headingTitle(h: Heading, accentClass = "text-gradient") {
  return <>{h.title}{h.accent ? <> <span className={accentClass}>{h.accent}</span></> : null}</>;
}
