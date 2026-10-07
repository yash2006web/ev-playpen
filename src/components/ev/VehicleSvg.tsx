import { cn } from "@/lib/utils";

export type VehicleZone = "battery" | "motor" | "frontWheels" | "rearWheels" | "cabin";

interface Props {
  speed: number;
  current: number;
  charging: boolean;
  interactive?: boolean;
  activeZone?: VehicleZone | null;
  hoverZone?: VehicleZone | null;
  onZoneHover?: (z: VehicleZone | null) => void;
  onZoneClick?: (z: VehicleZone) => void;
  className?: string;
}

const BODY =
  "M60,214 C60,190 76,176 112,170 L232,158 C282,120 334,96 420,93 C502,91 562,106 622,150 L702,165 C736,172 750,190 750,212 L750,226 C750,232 745,236 738,236 L655,236 A55,55 0 0 0 545,236 L255,236 A55,55 0 0 0 145,236 L72,236 C65,236 60,230 60,222 Z";
const GLASS = "M264,160 C302,127 342,111 420,109 C482,108 532,120 576,150 L570,158 L272,166 Z";

export function VehicleSvg({ speed, current, charging, interactive, activeZone, hoverZone, onZoneHover, onZoneClick, className }: Props) {
  const flowDur = charging ? 1.2 : Math.max(0.5, 3.2 - current / 60);
  const wheelDur = speed < 1 ? 0 : Math.max(0.25, 6 / (speed / 10 + 1));
  const moving = speed >= 1;

  const zoneProps = (z: VehicleZone, label: string) =>
    interactive
      ? {
          role: "button" as const,
          tabIndex: 0,
          "aria-label": label,
          onMouseEnter: () => onZoneHover?.(z),
          onMouseLeave: () => onZoneHover?.(null),
          onFocus: () => onZoneHover?.(z),
          onBlur: () => onZoneHover?.(null),
          onClick: () => onZoneClick?.(z),
          onKeyDown: (e: React.KeyboardEvent) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onZoneClick?.(z);
            }
          },
          className: "cursor-pointer outline-none",
        }
      : {};
  const lit = (z: VehicleZone) => activeZone === z || hoverZone === z;

  const Wheel = ({ cx, zone }: { cx: number; zone: VehicleZone }) => (
    <g {...zoneProps(zone, zone === "frontWheels" ? "Front wheels" : "Rear wheels")}>
      <circle cx={cx} cy={236} r={50} className={cn("fill-transparent transition-all", lit(zone) && "stroke-accent")} strokeWidth={3} />
      <circle cx={cx} cy={236} r={44} className="fill-foreground/85" />
      <circle cx={cx} cy={236} r={30} className="fill-card stroke-border" strokeWidth={2} />
      <g className={moving ? "spin-wheel" : undefined} style={{ ["--wheel-dur" as string]: `${wheelDur}s` }}>
        {[0, 72, 144, 216, 288].map((a) => (
          <line
            key={a}
            x1={cx}
            y1={236}
            x2={cx + 26 * Math.cos((a * Math.PI) / 180)}
            y2={236 + 26 * Math.sin((a * Math.PI) / 180)}
            className="stroke-muted-foreground/60"
            strokeWidth={4}
            strokeLinecap="round"
          />
        ))}
      </g>
      <circle cx={cx} cy={236} r={8} className={cn(lit(zone) ? "fill-accent" : "fill-primary")} />
    </g>
  );

  return (
    <svg viewBox="0 0 810 300" className={cn("w-full", className)} role={interactive ? "group" : "img"} aria-label="Electric vehicle visualization">
      <defs>
        <linearGradient id="ev-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-card)" />
          <stop offset="100%" stopColor="var(--color-surface)" />
        </linearGradient>
        <linearGradient id="ev-glass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.15" />
        </linearGradient>
        <linearGradient id="ev-sweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0" />
          <stop offset="50%" stopColor="var(--color-accent)" stopOpacity="0.5" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
        </linearGradient>
        <clipPath id="ev-clip">
          <path d={BODY} />
        </clipPath>
        <filter id="ev-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" />
        </filter>
      </defs>

      <ellipse cx={405} cy={286} rx={340} ry={10} className="fill-primary/10" />

      {/* Body */}
      <path d={BODY} fill="url(#ev-body)" className="stroke-border" strokeWidth={2} />
      <g clipPath="url(#ev-clip)">
        <rect x={0} y={80} width={160} height={180} fill="url(#ev-sweep)" className="sweep" />
      </g>
      <path d="M118,196 L742,196" className="stroke-border" strokeWidth={1.5} />
      <path d="M90,186 C150,180 200,178 240,176" className="stroke-primary/40" strokeWidth={2} fill="none" />

      {/* Cabin */}
      <g {...zoneProps("cabin", "Cabin")}>
        <path d={GLASS} fill="url(#ev-glass)" className={cn("stroke-primary/30 transition-all", lit("cabin") && "stroke-accent")} strokeWidth={lit("cabin") ? 3 : 1.5} />
        <line x1={420} y1={109} x2={420} y2={162} className="stroke-card" strokeWidth={5} />
      </g>

      {/* Lights */}
      <path d="M64,200 L96,196" className="stroke-accent" strokeWidth={4} strokeLinecap="round" />
      <path d="M64,200 L96,196" className="stroke-accent" strokeWidth={8} strokeLinecap="round" filter="url(#ev-glow)" opacity={0.6} />
      <path d="M742,186 L748,204" className="stroke-destructive/70" strokeWidth={4} strokeLinecap="round" />

      {/* Battery pack */}
      <g {...zoneProps("battery", "Battery")}>
        <rect x={262} y={206} width={270} height={22} rx={5} className={cn("fill-primary-soft stroke-primary/40 transition-all", lit("battery") && "stroke-accent")} strokeWidth={lit("battery") ? 3 : 1.5} />
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={270 + i * 29} y={211} width={22} height={12} rx={2} className={cn(charging ? "fill-accent" : "fill-primary/50")} opacity={charging ? 0.5 + ((i % 3) * 0.2) : 0.7} />
        ))}
      </g>

      {/* Motor */}
      <g {...zoneProps("motor", "Motor")}>
        <rect x={486} y={170} width={50} height={30} rx={8} className={cn("fill-card stroke-primary/50 transition-all", lit("motor") && "stroke-accent")} strokeWidth={lit("motor") ? 3 : 2} />
        <circle cx={511} cy={185} r={8} className={cn("fill-primary", moving && "pulse-ring")} style={{ transformOrigin: "511px 185px" }} />
      </g>

      {/* Energy flow */}
      {!charging && moving && (
        <g style={{ ["--flow-dur" as string]: `${flowDur}s` }}>
          <path d="M400,206 C430,190 470,186 486,185" className="energy-flow stroke-accent" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M536,185 C560,190 590,210 600,236" className="energy-flow stroke-primary" strokeWidth={2.5} fill="none" strokeLinecap="round" />
        </g>
      )}
      {charging && (
        <g style={{ ["--flow-dur" as string]: `${flowDur}s` }}>
          <circle cx={724} cy={178} r={6} className="fill-accent pulse-ring" style={{ transformOrigin: "724px 178px" }} />
          <path d="M724,178 C700,200 600,204 532,214" className="energy-flow stroke-accent" strokeWidth={3.5} fill="none" strokeLinecap="round" />
          <path d="M724,178 C700,200 600,204 532,214" className="stroke-accent/40" strokeWidth={10} fill="none" filter="url(#ev-glow)" />
        </g>
      )}

      <Wheel cx={200} zone="frontWheels" />
      <Wheel cx={600} zone="rearWheels" />
    </svg>
  );
}
