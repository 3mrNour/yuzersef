import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { cn } from "../../lib/cn";

interface SpotlightCardProps {
  children: ReactNode;
  className?: string;
  glow?: string;
  style?: CSSProperties;
}

/**
 * Adapted from the React Bits SpotlightCard component (reactbits.dev).
 * The glow follows the pointer through CSS custom properties, so React
 * never re-renders while the pointer moves.
 */
export function SpotlightCard({
  children,
  className,
  glow = "rgba(234, 192, 140, 0.18)",
  style,
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const node = ref.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    node.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    node.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn("group/spot relative isolate overflow-hidden", className)}
      style={style}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-300 group-focus-within/spot:opacity-100 group-hover/spot:opacity-100"
        style={{
          backgroundImage: `radial-gradient(460px circle at var(--spot-x, 50%) var(--spot-y, 50%), ${glow}, transparent 68%)`,
        }}
      />
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}
