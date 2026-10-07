import { useMemo, useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, YAxis } from "recharts";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import { SENSORS, sensorMeta, sensorStatus, toneClasses, type SensorMeta } from "@/data/telemetry/sensors";
import { AnimatedNumber, LiveBadge, Reveal, SectionHeader, Sparkline, StatusPill } from "./primitives";
import { cn } from "@/lib/utils";

function TelemetryCard({ meta, selected, onSelect, values }: { meta: SensorMeta; selected: boolean; onSelect: () => void; values: number[] }) {
  const { live } = useTelemetry();
  const status = sensorStatus(meta.key, live.systemStatus);
  const value = live[meta.key];
  const pct = Math.min(100, Math.max(0, ((value - meta.min) / (meta.max - meta.min)) * 100));
  const tone = status === "NORMAL" ? "var(--color-primary)" : status === "WARNING" ? "var(--color-warning)" : "var(--color-destructive)";
  return (
    <button
      onClick={onSelect}
      aria-pressed={selected}
      className={cn("group card-surface card-interactive relative flex flex-col overflow-hidden p-4 text-left", selected && "card-selected")}
    >
      {selected && <span className="absolute inset-x-0 top-0 h-0.5 bg-gradient-brand" />}
      <div className="flex items-center justify-between">
        <span className={cn("grid size-9 place-items-center rounded-xl transition-all group-hover:scale-110", selected ? "bg-gradient-brand text-primary-foreground" : "bg-primary-soft text-primary")}>
          <meta.icon className="size-4" />
        </span>
        <LiveBadge />
      </div>
      <p className="eyebrow mt-4">{meta.label}</p>
      <p className="mt-1 font-display text-3xl font-semibold text-foreground">
        <AnimatedNumber value={value} decimals={meta.decimals} />
        <span className="ml-1 text-sm font-medium text-muted-foreground">{meta.unit}</span>
      </p>
      <Sparkline data={values} stroke={tone} className="mt-3 h-8 w-full" />
      <div className="mt-3 flex items-center justify-between">
        <StatusPill status={status} />
        <div className="h-1 w-16 overflow-hidden rounded-full bg-secondary">
          <div className="h-full rounded-full bg-gradient-brand transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>
    </button>
  );
}

function SensorDetail() {
  const { live, history, selectedSensor, derived } = useTelemetry();
  const meta = sensorMeta(selectedSensor);
  const status = sensorStatus(selectedSensor, live.systemStatus);
  const data = useMemo(() => history.slice(-40).map((h) => ({ time: h.time, v: h[selectedSensor] })), [history, selectedSensor]);
  const [now, setNow] = useState(0);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, []);
  const vals = data.map((d) => d.v);
  const recent = vals.slice(-4);
  const older = vals.slice(-10, -4);
  const avg = (a: number[]) => a.reduce((s, x) => s + x, 0) / (a.length || 1);
  const diff = avg(recent) - avg(older);
  const thresh = (meta.max - meta.min) * 0.01;
  const trend = diff > thresh ? "up" : diff < -thresh ? "down" : "flat";
  const TrendIcon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : ArrowRight;
  const stroke = toneClasses[status] && (status === "NORMAL" ? "var(--color-primary)" : status === "WARNING" ? "var(--color-warning)" : "var(--color-destructive)");

  return (
    <div key={selectedSensor} className="card-surface animate-in fade-in slide-in-from-bottom-2 flex h-full flex-col p-6 duration-500">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Selected sensor</p>
          <h3 className="mt-1 flex items-center gap-2 text-xl font-semibold">
            <meta.icon className="size-5 text-primary" />
            {meta.label}
          </h3>
        </div>
        <LiveBadge />
      </div>
      <p className="mt-5 font-display text-6xl font-bold tracking-tight text-foreground">
        <AnimatedNumber value={live[selectedSensor]} decimals={meta.decimals} />
        <span className="ml-2 text-xl font-medium text-muted-foreground">{meta.unit}</span>
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
        <div>
          <p className="eyebrow">Status</p>
          <div className="mt-1.5">
            <StatusPill status={status} />
          </div>
        </div>
        <div>
          <p className="eyebrow">Trend</p>
          <p className="mt-1 flex items-center gap-1 font-semibold capitalize">
            <TrendIcon className="size-4 text-primary" />
            {trend === "up" ? "Increasing" : trend === "down" ? "Decreasing" : "Stable"}
          </p>
        </div>
        <div>
          <p className="eyebrow">Updated</p>
          <p className="mt-1 font-mono font-semibold tabular-nums">{derived.updatedAt && now ? ((now - derived.updatedAt) / 1000).toFixed(1) : "0.0"}s ago</p>
        </div>
      </div>
      <div className="mt-5 min-h-[140px] flex-1">
        <ResponsiveContainer width="100%" height="100%" minHeight={140}>
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="detailFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis hide domain={["dataMin - 2", "dataMax + 2"]} />
            <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={2.5} fill="url(#detailFill)" isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-3 flex justify-between font-mono text-xs text-muted-foreground">
        <span>MIN {vals.length ? Math.min(...vals).toFixed(meta.decimals) : "–"}</span>
        <span>AVG {vals.length ? avg(vals).toFixed(meta.decimals) : "–"}</span>
        <span>MAX {vals.length ? Math.max(...vals).toFixed(meta.decimals) : "–"}</span>
      </div>
    </div>
  );
}

export function Telemetry() {
  const { history, selectedSensor, selectSensor } = useTelemetry();
  const spark = useMemo(() => {
    const recent = history.slice(-24);
    return Object.fromEntries(SENSORS.map((s) => [s.key, recent.map((h) => h[s.key])]));
  }, [history]);
  return (
    <section id="telemetry" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-10 md:px-8">
      <Reveal>
        <SectionHeader eyebrow="02 · Live telemetry" title="Real-time sensor stream">
          <p className="max-w-sm text-sm text-muted-foreground">Select any sensor to inspect its live trend.</p>
        </SectionHeader>
        <div className="grid gap-5 xl:grid-cols-12">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:col-span-8 xl:grid-cols-4">
            {SENSORS.map((m) => (
              <TelemetryCard key={m.key} meta={m} selected={selectedSensor === m.key} onSelect={() => selectSensor(m.key)} values={spark[m.key] ?? []} />
            ))}
          </div>
          <div className="xl:col-span-4">
            <SensorDetail />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
