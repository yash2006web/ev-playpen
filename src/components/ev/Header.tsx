import { useEffect, useState } from "react";
import { Activity, History, LayoutDashboard, Menu, ShieldAlert, X, Zap } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import { scrollToId } from "./primitives";
import { cn } from "@/lib/utils";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "telemetry", label: "Telemetry", icon: Activity },
  { id: "diagnostics", label: "Diagnostics", icon: ShieldAlert },
  { id: "history", label: "History", icon: History },
];

export function Header() {
  const { derived } = useTelemetry();
  const [now, setNow] = useState(0);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("dashboard");

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-40% 0px -55% 0px" },
    );
    NAV.forEach((n) => {
      const el = document.getElementById(n.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, []);

  const ago = derived.updatedAt && now ? Math.max(0, (now - derived.updatedAt) / 1000) : 0;
  const go = (id: string) => {
    scrollToId(id);
    setOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 md:px-8">
        <button onClick={() => go("dashboard")} className="flex items-center gap-3 rounded-lg text-left">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-[var(--shadow-lift)]">
            <Zap className="size-5" strokeWidth={2.5} />
          </span>
          <span>
            <span className="block font-display text-sm font-bold tracking-[0.18em] text-foreground">EV MONITOR</span>
            <span className="block text-[11px] text-muted-foreground">Real-Time Vehicle Intelligence</span>
          </span>
        </button>

        <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Sections">
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => go(n.id)}
              className={cn(
                "group flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium transition-all",
                active === n.id ? "bg-primary-soft text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <n.icon className="size-4 transition-transform group-hover:scale-110" />
              {n.label}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3 lg:ml-4">
          <div className="hidden items-center gap-3 rounded-full border border-warning/40 bg-warning/10 py-1.5 pl-3 pr-4 sm:flex" title="Using simulated telemetry — Firebase not connected">
            <span className="live-dot size-2 rounded-full bg-warning text-warning" />
            <span className="font-mono text-[11px] font-semibold tracking-wider text-foreground">DEMO MODE</span>
            <span className="hidden text-[11px] text-muted-foreground md:inline">Simulation active · {ago.toFixed(1)}s ago</span>
          </div>
          <button
            className="grid size-10 place-items-center rounded-xl border border-border bg-card lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="animate-in fade-in slide-in-from-top-2 border-t border-border bg-card px-4 py-3 lg:hidden" aria-label="Mobile sections">
          <div className="mb-2 flex items-center gap-2 sm:hidden">
            <span className="live-dot size-2 rounded-full bg-warning text-warning" />
            <span className="font-mono text-[11px] font-semibold">DEMO MODE · Simulation active</span>
          </div>
          {NAV.map((n) => (
            <button key={n.id} onClick={() => go(n.id)} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium hover:bg-secondary">
              <n.icon className="size-4 text-primary" />
              {n.label}
            </button>
          ))}
        </nav>
      )}
    </header>
  );
}
