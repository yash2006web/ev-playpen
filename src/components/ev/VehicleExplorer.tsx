import { useState } from "react";
import { Battery, Cog, CircleDot, Armchair, ArrowRight, MousePointerClick } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import type { SensorKey } from "@/data/telemetry/types";
import { sensorMeta, sensorStatus } from "@/data/telemetry/sensors";
import { VehicleSvg, type VehicleZone } from "./VehicleSvg";
import { AnimatedNumber, Reveal, SectionHeader, StatusPill, scrollToId } from "./primitives";
import { cn } from "@/lib/utils";

const ZONES: Record<VehicleZone, { title: string; icon: typeof Battery; sensors: SensorKey[]; hint: string }> = {
  battery: { title: "Battery system", icon: Battery, sensors: ["batteryVoltage", "batteryCurrent", "batteryTemperature"], hint: "High-voltage pack" },
  motor: { title: "Motor system", icon: Cog, sensors: ["motorTemperature", "motorTorque", "vehicleSpeed"], hint: "Rear drive unit" },
  frontWheels: { title: "Front tyres", icon: CircleDot, sensors: ["tyrePressure"], hint: "Front axle" },
  rearWheels: { title: "Rear tyres", icon: CircleDot, sensors: ["tyrePressure"], hint: "Rear axle" },
  cabin: { title: "Cabin", icon: Armchair, sensors: ["batteryTemperature", "vehicleSpeed"], hint: "Occupant zone" },
};

export function VehicleExplorer() {
  const { live, selectSensor } = useTelemetry();
  const [active, setActive] = useState<VehicleZone>("battery");
  const [hover, setHover] = useState<VehicleZone | null>(null);
  const zone = ZONES[active];

  const open = (k: SensorKey) => {
    selectSensor(k);
    scrollToId("telemetry");
  };

  return (
    <section id="vehicle" className="mx-auto max-w-[1400px] scroll-mt-20 px-4 py-10 md:px-8">
      <Reveal>
        <SectionHeader eyebrow="03 · Vehicle" title="Interactive vehicle map">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <MousePointerClick className="size-4 text-primary" /> Hover or click a zone
          </p>
        </SectionHeader>
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="card-surface relative overflow-hidden p-4 md:p-8 lg:col-span-8">
            <div className="pointer-events-none absolute inset-0 grid-backdrop opacity-50" />
            <div className="relative">
              <VehicleSvg
                interactive
                speed={live.vehicleSpeed}
                current={live.batteryCurrent}
                charging={live.charging}
                activeZone={active}
                hoverZone={hover}
                onZoneHover={setHover}
                onZoneClick={setActive}
              />
              {hover && (
                <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 animate-in fade-in zoom-in-95 rounded-xl border border-border bg-popover px-3 py-2 text-xs shadow-[var(--shadow-lift)]">
                  <span className="font-semibold">{ZONES[hover].title}</span>
                  <span className="ml-2 text-muted-foreground">{ZONES[hover].hint} · click to inspect</span>
                </div>
              )}
            </div>
            <div className="relative mt-4 flex flex-wrap gap-2">
              {(Object.keys(ZONES) as VehicleZone[]).map((z) => {
                const Z = ZONES[z];
                return (
                  <button
                    key={z}
                    onClick={() => setActive(z)}
                    onMouseEnter={() => setHover(z)}
                    onMouseLeave={() => setHover(null)}
                    className={cn(
                      "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                      active === z ? "border-primary/50 bg-primary-soft text-primary" : "border-border bg-card text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Z.icon className="size-3.5" />
                    {Z.title}
                  </button>
                );
              })}
            </div>
          </div>

          <div key={active} className="card-surface animate-in fade-in slide-in-from-right-2 p-6 duration-500 lg:col-span-4">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-gradient-brand text-primary-foreground">
                <zone.icon className="size-5" />
              </span>
              <div>
                <p className="eyebrow">{zone.hint}</p>
                <h3 className="text-lg font-semibold uppercase tracking-wide">{zone.title}</h3>
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {zone.sensors.map((k) => {
                const m = sensorMeta(k);
                return (
                  <button key={k} onClick={() => open(k)} className="group flex w-full items-center justify-between rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary/40 hover:bg-primary-soft/40">
                    <span>
                      <span className="eyebrow block">{m.label}</span>
                      <span className="font-display text-2xl font-semibold">
                        <AnimatedNumber value={live[k]} decimals={m.decimals} />
                        <span className="ml-1 text-sm text-muted-foreground">{m.unit}</span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <StatusPill status={sensorStatus(k, live.systemStatus)} />
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-5 text-xs text-muted-foreground">
              Energy flow: {live.charging ? "charging into battery" : live.vehicleSpeed > 0 ? "battery → motor → wheels" : "idle"}
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
