import { useState } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipProps } from "recharts";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import type { SensorKey, TelemetrySample } from "@/data/telemetry/types";
import { sensorMeta } from "@/data/telemetry/sensors";
import { Reveal, SectionHeader } from "./primitives";
import { cn } from "@/lib/utils";

export interface SeriesDef {
  key: SensorKey;
  color: string;
}

export const CHARTS: { title: string; series: SeriesDef[] }[] = [
  { title: "Battery voltage & current", series: [{ key: "batteryVoltage", color: "var(--color-chart-1)" }, { key: "batteryCurrent", color: "var(--color-chart-2)" }] },
  { title: "Battery & motor temperature", series: [{ key: "batteryTemperature", color: "var(--color-chart-2)" }, { key: "motorTemperature", color: "var(--color-chart-3)" }] },
  { title: "Speed & torque", series: [{ key: "vehicleSpeed", color: "var(--color-chart-1)" }, { key: "motorTorque", color: "var(--color-chart-2)" }] },
  { title: "Tyre pressure", series: [{ key: "tyrePressure", color: "var(--color-chart-1)" }] },
];

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
      <p className="mb-1 font-mono text-muted-foreground">{label}</p>
      {payload.map((p) => {
        const m = sensorMeta(p.dataKey as SensorKey);
        return (
          <p key={String(p.dataKey)} className="flex items-center gap-2">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{m.label}</span>
            <span className="ml-auto font-semibold tabular-nums">
              {Number(p.value).toFixed(m.decimals)} {m.unit}
            </span>
          </p>
        );
      })}
    </div>
  );
}

export function ChartCard({ title, series, data, animate = false }: { title: string; series: SeriesDef[]; data: TelemetrySample[]; animate?: boolean }) {
  const [hidden, setHidden] = useState<SensorKey[]>([]);
  const [focus, setFocus] = useState<SensorKey | null>(null);
  const dual = series.length > 1;
  return (
    <div className="card-surface p-5">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <div className="flex flex-wrap gap-1.5">
          {series.map((s) => {
            const off = hidden.includes(s.key);
            const m = sensorMeta(s.key);
            return (
              <button
                key={s.key}
                onClick={() => setHidden((h) => (off ? h.filter((k) => k !== s.key) : [...h, s.key]))}
                onMouseEnter={() => setFocus(s.key)}
                onMouseLeave={() => setFocus(null)}
                aria-pressed={!off}
                className={cn("flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all", off ? "border-dashed border-border text-muted-foreground/60" : "border-border bg-background hover:bg-secondary")}
              >
                <span className="size-2 rounded-full" style={{ background: off ? "var(--color-border)" : s.color }} />
                {m.label} <span className="text-muted-foreground">({m.unit})</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 6, right: dual ? 0 : 8, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="time" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={40} />
            <YAxis yAxisId="a" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} width={44} />
            {dual && <YAxis yAxisId="b" orientation="right" tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }} tickLine={false} axisLine={false} domain={["auto", "auto"]} width={40} />}
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.3 }} />
            {series.map((s, i) => (
              <Line
                key={s.key}
                yAxisId={i === 0 ? "a" : "b"}
                type="monotone"
                dataKey={s.key}
                stroke={s.color}
                strokeWidth={focus === s.key ? 3.5 : 2.2}
                strokeOpacity={focus && focus !== s.key ? 0.25 : 1}
                dot={false}
                hide={hidden.includes(s.key)}
                isAnimationActive={animate}
                animationDuration={600}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function PerformanceCharts() {
  const { history } = useTelemetry();
  return (
    <section id="performance" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-10 md:px-8">
      <Reveal>
        <SectionHeader eyebrow="05 · Performance" title="Live performance charts">
          <p className="text-sm text-muted-foreground">Last {history.length} samples · tap legend to toggle</p>
        </SectionHeader>
        <div className="grid gap-5 md:grid-cols-2">
          {CHARTS.map((c) => (
            <ChartCard key={c.title} title={c.title} series={c.series} data={history} />
          ))}
        </div>
      </Reveal>
    </section>
  );
}
