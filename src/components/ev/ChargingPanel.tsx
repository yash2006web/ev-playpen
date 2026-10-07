import { BatteryCharging, Plug, PlugZap, Route, Timer, Zap } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import { AnimatedNumber, Reveal, SectionHeader } from "./primitives";
import { cn } from "@/lib/utils";

export function ChargingPanel() {
  const { live, derived, wantCharge, setWantCharge } = useTelemetry();
  const charging = live.charging;
  const pending = wantCharge && !charging;
  const r = 92;
  const c = 2 * Math.PI * r;
  const etaMin = charging && derived.chargePowerKw > 0 ? ((100 - derived.soc) / 100) * 75 * 60 / derived.chargePowerKw : 0;

  return (
    <section id="charging" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-10 md:px-8">
      <Reveal>
        <SectionHeader eyebrow="05 · Energy" title="Charging">
          <button
            onClick={() => setWantCharge(!wantCharge)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all active:scale-95",
              wantCharge ? "border border-border bg-card text-foreground hover:bg-secondary" : "bg-gradient-brand text-primary-foreground shadow-[var(--shadow-lift)] hover:brightness-105",
            )}
          >
            {wantCharge ? <Plug className="size-4" /> : <PlugZap className="size-4" />}
            {wantCharge ? "Stop mock charging" : "Simulate charging"}
          </button>
        </SectionHeader>
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="card-surface relative overflow-hidden p-6 lg:col-span-5">
            {charging && <div className="pointer-events-none absolute inset-0 bg-hero opacity-80" />}
            <div className="relative mx-auto aspect-square w-full max-w-[260px]">
              <svg viewBox="0 0 220 220" className="-rotate-90">
                <defs>
                  <linearGradient id="socGrad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" />
                    <stop offset="100%" stopColor="var(--color-accent)" />
                  </linearGradient>
                </defs>
                <circle cx={110} cy={110} r={r} className="fill-none stroke-secondary" strokeWidth={14} />
                <circle cx={110} cy={110} r={r} fill="none" stroke="url(#socGrad)" strokeWidth={14} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - derived.soc / 100)} className="transition-all duration-1000" />
                {charging && <circle cx={110} cy={110} r={r} fill="none" className="energy-flow stroke-card" strokeWidth={3} style={{ ["--flow-dur" as string]: "1s" }} />}
              </svg>
              <div className="absolute inset-0 grid place-items-center text-center">
                <div>
                  <BatteryCharging className={cn("mx-auto size-7", charging ? "animate-pulse text-accent" : "text-muted-foreground")} />
                  <p className="mt-1 font-display text-5xl font-bold">
                    <AnimatedNumber value={derived.soc} decimals={0} />
                    <span className="text-2xl text-muted-foreground">%</span>
                  </p>
                  <p className="eyebrow">Battery</p>
                </div>
              </div>
            </div>
            <div className="relative mt-4 text-center">
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-xs font-bold tracking-widest",
                  charging ? "border-accent/40 bg-accent/10 text-primary" : pending ? "border-warning/40 bg-warning/10 text-warning" : "border-border bg-secondary text-muted-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full bg-current", charging && "live-dot")} />
                {charging ? "CHARGING" : pending ? "SLOWING TO PARK…" : "NOT CHARGING"}
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {[
              { icon: Zap, label: "Charging power", value: derived.chargePowerKw, d: 1, unit: "kW", live: charging },
              { icon: BatteryCharging, label: "Battery level", value: derived.soc, d: 0, unit: "%", live: false },
              { icon: Route, label: "Estimated range", value: derived.rangeKm, d: 0, unit: "km", live: false },
              { icon: Timer, label: "Time to full", value: etaMin, d: 0, unit: "min", live: charging },
            ].map((m) => (
              <div key={m.label} className="card-surface flex flex-col justify-between p-5">
                <div className="flex items-center justify-between">
                  <span className={cn("grid size-10 place-items-center rounded-xl", m.live ? "bg-gradient-brand text-primary-foreground" : "bg-primary-soft text-primary")}>
                    <m.icon className="size-5" />
                  </span>
                  {m.live && <span className="live-dot size-2 rounded-full bg-accent text-accent" />}
                </div>
                <div className="mt-6">
                  <p className="eyebrow">{m.label}</p>
                  <p className="mt-1 font-display text-3xl font-semibold">
                    <AnimatedNumber value={m.value} decimals={m.d} />
                    <span className="ml-1 text-sm text-muted-foreground">{m.unit}</span>
                  </p>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground sm:col-span-2">Values are simulated for this prototype and do not come from real hardware.</p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
