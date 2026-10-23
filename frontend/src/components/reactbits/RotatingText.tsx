import { AnimatePresence, MotionConfig, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import { cn } from "../../lib/cn";

interface RotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
}

/**
 * Adapted from the React Bits RotatingText component (reactbits.dev).
 * Simplified for Arabic: words rotate as whole units so letter joining
 * is never broken by per-character animation.
 */
export function RotatingText({ texts, interval = 2600, className }: RotatingTextProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduceMotion || paused || texts.length < 2) return;
    const timer = window.setTimeout(
      () => setIndex((current) => (current + 1) % texts.length),
      interval,
    );
    return () => window.clearTimeout(timer);
  }, [index, interval, paused, reduceMotion, texts.length]);

  const active = texts[Math.min(index, texts.length - 1)] ?? "";

  if (reduceMotion) {
    return <span className={className}>{active}</span>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <span
        className={cn("relative inline-flex overflow-hidden align-bottom", className)}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <span className="sr-only">{active}</span>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={active}
            aria-hidden="true"
            initial={{ y: "0.62em", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-0.62em", opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.7 }}
            className="inline-block whitespace-nowrap"
          >
            {active}
          </motion.span>
        </AnimatePresence>
      </span>
    </MotionConfig>
  );
}
