import { AlertOctagon, AlertTriangle, CheckCircle2, Info, ShieldCheck } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import { toneClasses } from "@/data/telemetry/sensors";
import type { TelemetryEvent } from "@/data/telemetry/types";
import { Reveal, SectionHeader, StatusPill } from "./primitives";
import { cn } from "@/lib/utils";

const EVENT_TONE: Record<TelemetryEvent["tone"], { icon: typeof Info; cls: string }> = {
  normal: { icon: CheckCircle2, cls: "text-success bg-success/10" },
  info: { icon: Info, cls: "text-primary bg-primary-soft" },
  warning: { icon: AlertTriangle, cls: "text-warning bg-warning/10" },
  critical: { icon: AlertOctagon, cls: "text-destructive bg-destructive/10" },
};

export function Diagnostics() {
  const { live, events } = useTelemetry();
  const t = toneClasses[live.systemStatus];
  const logs = events.filter((e) => e.kind === "log").slice(0, 7);
  return (
    <section id="diagnostics" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-10 md:px-8">
      <Reveal>
        <SectionHeader eyebrow="04 · Diagnostics" title="Diagnostic center" />
        <div className="grid gap-5 lg:grid-cols-12">
          <div className={cn("card-surface relative overflow-hidden p-6 lg:col-span-7", t.border)}>
            <div className={cn("pointer-events-none absolute -right-20 -top-20 size-64 rounded-full blur-3xl", t.bg)} />
            <div className="relative grid gap-6 sm:grid-cols-2">
              <div>
                <p className="eyebrow">System status</p>
                <div className="mt-3 flex items-center gap-3">
                  <ShieldCheck className={cn("size-8", t.text)} />
                  <span className={cn("font-display text-3xl font-bold", t.text)}>{live.systemStatus}</span>
                </div>
              </div>
              <div>
                <p className="eyebrow">Primary diagnosis</p>
                <p className="mt-3 font-display text-lg font-semibold">{live.primaryDiagnosis}</p>
              </div>
            </div>
            <div className="relative mt-8">
              <p className="eyebrow">Active warnings ({live.activeWarnings.length})</p>
              <div className="mt-3 space-y-2">
                {live.activeWarnings.length === 0 ? (
                  <div className="flex items-center gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-medium text-success">
                    <CheckCircle2 className="size-5" /> No active warnings
                  </div>
                ) : (
                  live.activeWarnings.map((w) => (
                    <div key={w} className={cn("flex animate-in fade-in slide-in-from-left-2 items-center gap-3 rounded-xl border p-4 text-sm font-semibold", t.border, t.bg, t.text)}>
                      <AlertTriangle className="size-5 shrink-0" /> {w}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          <div className="card-surface p-6 lg:col-span-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow">System log</p>
              <StatusPill status="NORMAL" label="STREAMING" />
            </div>
            <ol className="mt-4 space-y-1">
              {logs.map((e) => (
                <li key={e.id} className="flex animate-in fade-in slide-in-from-top-1 items-center gap-4 rounded-lg px-2 py-2 text-sm duration-500 hover:bg-secondary">
                  <span className="font-mono text-xs text-muted-foreground tabular-nums">{e.time}</span>
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span>{e.title}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function AlertsTimeline() {
  const { events } = useTelemetry();
  const alerts = events.filter((e) => e.kind === "alert").slice(0, 8);
  return (
    <section id="alerts" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-10 md:px-8">
      <Reveal>
        <SectionHeader eyebrow="08 · Events" title="Recent alerts & events" />
        <div className="card-surface p-6">
          <ol className="relative">
            {alerts.map((e, i) => {
              const tone = EVENT_TONE[e.tone];
              return (
                <li key={e.id} className="relative flex animate-in fade-in slide-in-from-top-2 gap-4 pb-6 duration-500 last:pb-0">
                  {i < alerts.length - 1 && <span className="absolute left-[17px] top-9 h-[calc(100%-2.25rem)] w-px bg-border" />}
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full", tone.cls)}>
                    <tone.icon className="size-4" />
                  </span>
                  <div className="flex flex-1 flex-wrap items-baseline justify-between gap-2 pt-1.5">
                    <div>
                      <p className="font-display text-sm font-semibold uppercase tracking-wide">{e.title}</p>
                      {e.detail && <p className="text-sm text-muted-foreground">{e.detail}</p>}
                    </div>
                    <span className="font-mono text-xs text-muted-foreground tabular-nums">{e.time}</span>
                  </div>
                </li>
              );
            })}
            {alerts.length === 0 && <li className="text-sm text-muted-foreground">Waiting for events…</li>}
          </ol>
        </div>
      </Reveal>
    </section>
  );
}
