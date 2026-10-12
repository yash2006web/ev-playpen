import { Thermometer, Gauge, Battery } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import { toneClasses } from "@/data/telemetry/sensors";
import { Reveal, SectionHeader } from "./primitives";
import { cn } from "@/lib/utils";

function HealthRing({ value, status }: { value: number; status: keyof typeof toneClasses }) {
  const r = 84;
  const c = 2 * Math.PI * r;
  const t = toneClasses[status];
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[240px]">
      <div
        className={cn("pulse-ring absolute inset-4 rounded-full", t.bg)}
        style={{ ["--pulse-dur" as string]: status === "CRITICAL" ? "1.2s" : status === "WARNING" ? "2s" : "3.2s" }}
      />
      <svg viewBox="0 0 200 200" className="relative -rotate-90">
        <circle cx={100} cy={100} r={r} className="fill-none stroke-secondary" strokeWidth={12} />
        <circle
          cx={100}
          cy={100}
          r={r}
          className={cn("fill-none transition-all duration-1000", t.stroke)}
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - value / 100)}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div className="translate-y-1.5">
          <p className="eyebrow">System health</p>
          <p className={cn("mt-1 font-mono text-sm font-bold tracking-widest", t.text)}>{status}</p>
        </div>
      </div>
    </div>
  );
}

export function SystemHealth() {
  const { live, derived } = useTelemetry();
  const subs = [
    { label: "Thermal", icon: Thermometer, ok: live.systemStatus !== "CRITICAL", detail: `${live.motorTemperature.toFixed(0)} °C motor` },
    { label: "Powertrain", icon: Gauge, ok: live.systemStatus !== "CRITICAL", detail: `${live.motorTorque.toFixed(0)} Nm` },
    { label: "Battery", icon: Battery, ok: true, detail: `${derived.soc.toFixed(0)}% · ${live.batteryVoltage.toFixed(0)} V` },
    { label: "Tyres", icon: Gauge, ok: live.systemStatus !== "WARNING", detail: `${live.tyrePressure.toFixed(1)} PSI` },
  ];
  return (
    <section className="mx-auto max-w-[1400px] px-4 py-10 md:px-8">
      <Reveal>
        <SectionHeader eyebrow="01 · Overview" title="System health" />
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="card-surface p-6 lg:col-span-5">
            <HealthRing value={derived.health} status={live.systemStatus} />
            <p className="mt-4 text-center text-sm text-muted-foreground">{live.primaryDiagnosis}</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-7">
            {subs.map((s) => {
              const st = s.ok ? "NORMAL" : live.systemStatus;
              const t = toneClasses[st];
              return (
                <div key={s.label} className="card-surface flex flex-col justify-between p-5">
                  <div className="flex items-center justify-between">
                    <span className={cn("grid size-10 place-items-center rounded-xl", t.bg, t.text)}>
                      <s.icon className="size-5" />
                    </span>
                    <span className={cn("font-mono text-[10px] font-bold tracking-widest", t.text)}>{st}</span>
                  </div>
                  <div className="mt-6">
                    <p className="font-display font-semibold">{s.label}</p>
                    <p className="text-sm text-muted-foreground">{s.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
