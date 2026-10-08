import { Plug, PlugZap } from "lucide-react";
import { useTelemetry } from "@/data/telemetry/TelemetryProvider";
import { cn } from "@/lib/utils";

export function ChargingPanel() {
  const { live } = useTelemetry();
  const charging = live.charging;

  return (
    <section className="mx-auto max-w-[1400px] px-4 md:px-8">
      <div
        className={cn(
          "card-surface flex items-center justify-center gap-4 px-6 py-5 transition-colors duration-500",
          charging && "border-accent/40",
        )}
      >
        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-xl transition-all duration-500",
            charging ? "bg-gradient-brand text-primary-foreground shadow-[var(--shadow-lift)]" : "bg-secondary text-muted-foreground",
          )}
        >
          {charging ? <PlugZap className="size-5" /> : <Plug className="size-5" />}
        </span>
        <span
          className={cn(
            "font-mono text-sm font-bold tracking-[0.2em] transition-colors duration-500",
            charging ? "text-primary" : "text-muted-foreground",
          )}
        >
          {charging ? "CHARGING CONNECTED" : "CHARGING DISCONNECTED"}
        </span>
        <span className={cn("size-2 rounded-full transition-colors duration-500", charging ? "live-dot bg-accent text-accent" : "bg-muted-foreground/40")} />
      </div>
    </section>
  );
}
