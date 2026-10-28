"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { motion, useInView } from "motion/react";

type Tag = "div" | "li" | "article" | "section" | "button";
type Props = ComponentProps<typeof motion.div> & { as?: Tag; fallbackMs?: number };

/**
 * Like a motion element with `whileInView`, but guaranteed to become visible: it animates when scrolled
 * into view, or after `fallbackMs` at the latest — so a section can never be left blank.
 */
export function SeenMotion({ as = "div", whileInView, viewport, fallbackMs = 2200, ...rest }: Props) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref as React.RefObject<HTMLElement>, { once: true, margin: (viewport?.margin ?? "0px 0px -40px 0px") as never });
  const [late, setLate] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLate(true), fallbackMs); return () => clearTimeout(t); }, [fallbackMs]);
  const M = motion[as] as typeof motion.div;
  return <M ref={ref as React.Ref<HTMLDivElement>} {...rest} animate={inView || late ? (whileInView as never) : rest.animate} />;
}
