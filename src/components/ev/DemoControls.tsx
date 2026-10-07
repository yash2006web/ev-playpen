import { useState } from "react";
import { FlaskConical, PlugZap, X } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import type { SystemStatus } from "@/data/telemetry/types";
import { toneClasses } from "@/data/telemetry/sensors";
import { cn } from "@/lib/utils";

const OPTIONS: { id: SystemStatus; desc: string }[] = [
  { id: "NORMAL", desc: "All systems healthy" },
  { id: "WARNING", desc: "Low tyre pressure" },
  { id: "CRITICAL", desc: "High motor temperature" },
];

export function DemoControls() {
  const { mode, setMode, wantCharge, setWantCharge } = useTelemetry();
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-72 animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border bg-popover p-4 shadow-[var(--shadow-lift)]">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Demo controls</p>
            <button onClick={() => setOpen(false)} aria-label="Close demo controls" className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
              <X className="size-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Simulate states to preview the UI. No real diagnosis logic.</p>
          <div className="mt-3 space-y-2">
            {OPTIONS.map((o) => {
              const t = toneClasses[o.id];
              return (
                <button
                  key={o.id}
                  onClick={() => setMode(o.id)}
                  aria-pressed={mode === o.id}
                  className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm transition-all", mode === o.id ? cn(t.border, t.bg) : "border-border hover:bg-secondary")}
                >
                  <span className={cn("size-2.5 rounded-full bg-current", t.text)} />
                  <span>
                    <span className={cn("block font-mono text-xs font-bold tracking-wider", t.text)}>{o.id}</span>
                    <span className="text-xs text-muted-foreground">{o.desc}</span>
                  </span>
                </button>
              );
            })}
            <button onClick={() => setWantCharge(!wantCharge)} className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left text-sm hover:bg-secondary">
              <PlugZap className="size-4 text-primary" />
              {wantCharge ? "Stop charging" : "Start charging"}
            </button>
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="ml-auto flex items-center gap-2 rounded-full border border-border bg-card/90 px-3.5 py-2 text-xs font-medium text-muted-foreground shadow-[var(--shadow-soft)] backdrop-blur transition-all hover:text-foreground active:scale-95"
      >
        <FlaskConical className="size-3.5" /> Demo
      </button>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-10 border-t border-border bg-surface/60">
      <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-4 px-4 py-8 text-xs text-muted-foreground md:px-8">
        <p>
          <span className="font-display font-bold tracking-[0.18em] text-foreground">EV MONITOR</span> · Real-Time Monitoring & Performance Diagnosis System
        </p>
        <p className="font-mono">Source: mock simulator · Firebase not connected · v0.1 prototype</p>
      </div>
    </footer>
  );
}
