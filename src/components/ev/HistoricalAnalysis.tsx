import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Battery, Flame, Gauge, Zap } from "lucide-react";
import { generateHistory, RANGES, type HistoryRange } from "@/data/telemetry/history";
import { AnimatedNumber, Reveal, SectionHeader } from "./primitives";
import { CHARTS, ChartCard } from "./PerformanceCharts";
import { cn } from "@/lib/utils";

export function HistoricalAnalysis() {
  const [range, setRange] = useState<HistoryRange>("15m");
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), []);
  const data = useMemo(() => (now ? generateHistory(range, now) : null), [range, now]);
  const s = data?.stats;

  const stats = [
    { icon: Battery, label: "Avg battery voltage", value: s?.avgVoltage ?? 0, d: 1, unit: "V" },
    { icon: Zap, label: "Max battery current", value: s?.maxCurrent ?? 0, d: 1, unit: "A" },
    { icon: Flame, label: "Max motor temp", value: s?.maxMotorTemp ?? 0, d: 1, unit: "°C" },
    { icon: Gauge, label: "Avg vehicle speed", value: s?.avgSpeed ?? 0, d: 0, unit: "km/h" },
    { icon: AlertTriangle, label: "Warning events", value: s?.warningEvents ?? 0, d: 0, unit: "" },
  ];
  const records = data?.samples.slice(-6).reverse() ?? [];

  return (
    <section id="history" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-10 md:px-8">
      <Reveal>
        <SectionHeader eyebrow="07 · History" title="Historical analysis">
          <div role="tablist" aria-label="Time range" className="flex rounded-full border border-border bg-card p-1 shadow-[var(--shadow-soft)]">
            {RANGES.map((r) => (
              <button
                key={r.id}
                role="tab"
                aria-selected={range === r.id}
                onClick={() => setRange(r.id)}
                className={cn("rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold tracking-wider transition-all", range === r.id ? "bg-gradient-brand text-primary-foreground shadow" : "text-muted-foreground hover:text-foreground")}
              >
                {r.label}
              </button>
            ))}
          </div>
        </SectionHeader>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          {stats.map((m) => (
            <div key={m.label} className="card-surface card-interactive p-5">
              <m.icon className={cn("size-5", m.label.startsWith("Warning") ? "text-warning" : "text-primary")} />
              <p className="eyebrow mt-4">{m.label}</p>
              <p className="mt-1 font-display text-2xl font-semibold md:text-3xl">
                <AnimatedNumber value={m.value} decimals={m.d} />
                <span className="ml-1 text-sm text-muted-foreground">{m.unit}</span>
              </p>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-7">
            {data && CHARTS[2] && (
              <ChartCard key={range} title={CHARTS[2].title} series={CHARTS[2].series} data={data.samples} animate />
            )}
          </div>
          <div className="card-surface overflow-hidden lg:col-span-5">
            <p className="eyebrow px-5 pt-5">Recent records</p>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-2 font-medium">Time</th>
                    <th className="px-2 py-2 font-medium">V</th>
                    <th className="px-2 py-2 font-medium">A</th>
                    <th className="px-2 py-2 font-medium">km/h</th>
                    <th className="px-5 py-2 font-medium">Motor °C</th>
                  </tr>
                </thead>
                <tbody key={range} className="animate-in fade-in duration-500">
                  {records.map((r) => (
                    <tr key={r.t} className="border-b border-border/60 tabular-nums last:border-0 hover:bg-secondary/60">
                      <td className="px-5 py-2.5 font-mono text-xs text-muted-foreground">{r.time}</td>
                      <td className="px-2 py-2.5">{r.batteryVoltage.toFixed(1)}</td>
                      <td className="px-2 py-2.5">{r.batteryCurrent.toFixed(0)}</td>
                      <td className="px-2 py-2.5">{r.vehicleSpeed.toFixed(0)}</td>
                      <td className="px-5 py-2.5">{r.motorTemperature.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
