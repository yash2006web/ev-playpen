import { useEffect, useRef, useState, type ReactNode } from "react";
import type { SystemStatus } from "@/data/telemetry/types";
import { toneClasses } from "@/data/telemetry/sensors";
import { cn } from "@/lib/utils";

export function AnimatedNumber({ value, decimals = 1, className }: { value: number; decimals?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(value);
  const [initial] = useState(() => value.toFixed(decimals));
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = from.current;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || start === value) {
      el.textContent = value.toFixed(decimals);
      from.current = value;
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / 800);
      const v = start + (value - start) * (1 - Math.pow(1 - p, 3));
      from.current = v;
      el.textContent = v.toFixed(decimals);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, decimals]);
  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {initial}
    </span>
  );
}

export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={cn("reveal", visible && "is-visible", className)} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

export function StatusPill({ status, label, size = "sm" }: { status: SystemStatus; label?: string; size?: "sm" | "md" }) {
  const t = toneClasses[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-mono font-semibold tracking-wider",
        t.text,
        t.bg,
        t.border,
        size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs",
      )}
    >
      <span className="live-dot size-1.5 rounded-full bg-current" />
      {label ?? status}
    </span>
  );
}

export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold tracking-widest text-primary">
      <span className="live-dot size-1.5 rounded-full bg-primary" />
      LIVE
    </span>
  );
}

export function SectionHeader({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-1.5 text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function Sparkline({ data, className, stroke = "var(--color-primary)" }: { data: number[]; className?: string; stroke?: string }) {
  if (data.length < 2) return <svg className={className} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * 100},${28 - ((v - min) / span) * 24}`).join(" ");
  return (
    <svg viewBox="0 0 100 30" preserveAspectRatio="none" className={className} aria-hidden>
      <polyline points={`0,30 ${pts} 100,30`} fill={stroke} fillOpacity={0.08} stroke="none" />
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.6} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export const scrollToId = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
