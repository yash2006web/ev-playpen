import type { TelemetrySample } from "./types";
import { formatTime } from "./mockEngine";

export type HistoryRange = "5m" | "15m" | "1h" | "today";

export const RANGES: { id: HistoryRange; label: string; points: number; stepSec: number }[] = [
  { id: "5m", label: "5 MIN", points: 60, stepSec: 5 },
  { id: "15m", label: "15 MIN", points: 90, stepSec: 10 },
  { id: "1h", label: "1 HOUR", points: 120, stepSec: 30 },
  { id: "today", label: "TODAY", points: 144, stepSec: 300 },
];

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Mock historical dataset — later replaced by /EV_Monitoring/history. */
export function generateHistory(range: HistoryRange, now: number) {
  const cfg = RANGES.find((r) => r.id === range)!;
  const rand = seeded(cfg.points * 31 + 7);
  const out: TelemetrySample[] = [];
  let motorT = 45;
  let battT = 30;
  for (let i = 0; i < cfg.points; i++) {
    const p = i / cfg.points;
    const speed = Math.max(0, 62 + 45 * Math.sin(p * Math.PI * 4 + 0.6) + 18 * Math.sin(p * 23) + (rand() - 0.5) * 10);
    const torque = Math.max(0, 40 + speed * 1.05 + (rand() - 0.5) * 30);
    const current = Math.min(198, Math.max(0, torque * 0.36 + speed * 0.3 + (rand() - 0.5) * 10));
    motorT += (30 + speed * 0.42 + torque * 0.06 - motorT) * 0.12;
    battT += (24 + current * 0.1 - battT) * 0.08;
    const t = now - (cfg.points - i) * cfg.stepSec * 1000;
    out.push({
      t,
      time: range === "today" ? formatTime(new Date(t)).slice(0, 5) : formatTime(new Date(t)),
      vehicleSpeed: speed,
      motorTorque: torque,
      batteryCurrent: current,
      batteryVoltage: 395 - current * 0.09 - p * 8 + (rand() - 0.5) * 1.5,
      motorTemperature: motorT,
      batteryTemperature: battT,
      tyrePressure: 33.2 + (rand() - 0.5) * 0.5,
    });
  }
  const avg = (k: keyof TelemetrySample) => out.reduce((a, s) => a + (s[k] as number), 0) / out.length;
  const max = (k: keyof TelemetrySample) => Math.max(...out.map((s) => s[k] as number));
  return {
    samples: out,
    stats: {
      avgVoltage: avg("batteryVoltage"),
      maxCurrent: max("batteryCurrent"),
      maxMotorTemp: max("motorTemperature"),
      avgSpeed: avg("vehicleSpeed"),
      warningEvents: out.filter((s) => s.batteryCurrent > 175).length,
    },
  };
}
