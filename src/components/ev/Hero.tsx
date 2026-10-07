import { AlertTriangle, BatteryCharging, Gauge, Lock, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import { toneClasses } from "@/data/telemetry/sensors";
import { AnimatedNumber, StatusPill, scrollToId } from "./primitives";
import { VehicleSvg } from "./VehicleSvg";
import { cn } from "@/lib/utils";

const HEADLINE = {
  NORMAL: "All vehicle systems operating normally",
  WARNING: "Attention required — a system needs review",
  CRITICAL: "Critical condition — immediate action advised",
};

export function Hero() {
  const { live, derived } = useTelemetry();
  const status = live.systemStatus;
  const t = toneClasses[status];
  const StatusIcon = status === "NORMAL" ? ShieldCheck : AlertTriangle;

  return (
    <section id="dashboard" className="relative scroll-mt-24 overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-hero" />
      <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-60" />
      <div className="relative mx-auto grid max-w-[1400px] gap-8 px-4 pb-10 pt-10 md:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:pt-16">
        <div className="flex flex-col justify-center">
          <p className="eyebrow">System health · {live.rtcTime}</p>
          <div className="mt-4 flex items-center gap-3">
            <span className={cn("grid size-12 place-items-center rounded-2xl", t.bg, t.text)}>
              <StatusIcon className="size-6" />
            </span>
            <h1 className={cn("text-5xl font-bold md:text-6xl", t.text)}>{status}</h1>
          </div>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">{HEADLINE[status]}</p>

          <div className="mt-8 grid grid-cols-3 gap-3">
            <button onClick={() => scrollToId("diagnostics")} className="card-surface card-interactive p-4 text-left">
              <p className="eyebrow">Diagnosis</p>
              <p className={cn("mt-2 font-display text-sm font-semibold", t.text)}>{status === "NORMAL" ? "NORMAL" : live.primaryDiagnosis}</p>
            </button>
            <button onClick={() => scrollToId("diagnostics")} className="card-surface card-interactive p-4 text-left" aria-label="Active warnings — view diagnostics">
              <p className="eyebrow">Warnings</p>
              <p className={cn("mt-1 font-display text-3xl font-bold", live.activeWarnings.length ? t.text : "text-foreground")}>{live.activeWarnings.length}</p>
            </button>
            <button onClick={() => scrollToId("ai")} className="relative overflow-hidden rounded-2xl border border-dashed border-primary/40 bg-primary-soft/60 p-4 text-left">
              <p className="eyebrow flex items-center gap-1">
                <Lock className="size-3" /> AI Analysis
              </p>
              <p className="mt-2 flex items-center gap-1 font-display text-sm font-semibold text-primary">
                <Sparkles className="size-3.5" /> Coming soon
              </p>
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="float-slow relative">
            <div className="absolute inset-x-[10%] bottom-[12%] top-[30%] rounded-full bg-accent/20 blur-3xl" />
            <VehicleSvg speed={live.vehicleSpeed} current={live.batteryCurrent} charging={live.charging} className="relative drop-shadow-xl" />
          </div>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {[
              { icon: Gauge, label: "Speed", value: live.vehicleSpeed, d: 0, unit: "km/h", go: "telemetry" },
              { icon: Zap, label: "Current", value: live.batteryCurrent, d: 0, unit: "A", go: "telemetry" },
              { icon: BatteryCharging, label: "Battery", value: derived.soc, d: 0, unit: "%", go: "charging" },
            ].map((m) => (
              <button key={m.label} onClick={() => scrollToId(m.go)} className="group card-surface card-interactive flex items-center gap-3 p-3 text-left">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-110">
                  <m.icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="eyebrow block">{m.label}</span>
                  <span className="font-display text-lg font-semibold">
                    <AnimatedNumber value={m.value} decimals={m.d} />
                    <span className="ml-1 text-xs font-medium text-muted-foreground">{m.unit}</span>
                  </span>
                </span>
              </button>
            ))}
          </div>
          <div className="absolute right-2 top-0 hidden md:block">
            <StatusPill status={live.charging ? "NORMAL" : status} label={live.charging ? "CHARGING" : live.vehicleSpeed > 0 ? "DRIVING" : "PARKED"} size="md" />
          </div>
        </div>
      </div>
    </section>
  );
}
