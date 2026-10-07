import { Battery, Gauge, Thermometer, Zap, Cog, CircleDot, Flame, type LucideIcon } from "lucide-react";
import type { SensorKey, SystemStatus } from "./types";

export interface SensorMeta {
  key: SensorKey;
  label: string;
  unit: string;
  decimals: number;
  min: number;
  max: number;
  icon: LucideIcon;
}

export const SENSORS: SensorMeta[] = [
  { key: "batteryVoltage", label: "Battery Voltage", unit: "V", decimals: 1, min: 300, max: 450, icon: Battery },
  { key: "batteryCurrent", label: "Battery Current", unit: "A", decimals: 1, min: 0, max: 200, icon: Zap },
  { key: "batteryTemperature", label: "Battery Temp", unit: "°C", decimals: 1, min: 20, max: 65, icon: Thermometer },
  { key: "motorTemperature", label: "Motor Temp", unit: "°C", decimals: 1, min: 20, max: 120, icon: Flame },
  { key: "vehicleSpeed", label: "Vehicle Speed", unit: "km/h", decimals: 0, min: 0, max: 160, icon: Gauge },
  { key: "motorTorque", label: "Motor Torque", unit: "Nm", decimals: 0, min: 0, max: 400, icon: Cog },
  { key: "tyrePressure", label: "Tyre Pressure", unit: "PSI", decimals: 1, min: 20, max: 40, icon: CircleDot },
];

export const sensorMeta = (k: SensorKey) => SENSORS.find((s) => s.key === k)!;

/**
 * Card status is driven by the mock demo state only — no real thresholds.
 */
export function sensorStatus(key: SensorKey, system: SystemStatus): SystemStatus {
  if (system === "WARNING" && key === "tyrePressure") return "WARNING";
  if (system === "CRITICAL" && key === "motorTemperature") return "CRITICAL";
  return "NORMAL";
}

export const toneClasses: Record<SystemStatus, { text: string; bg: string; border: string; stroke: string }> = {
  NORMAL: { text: "text-success", bg: "bg-success/10", border: "border-success/30", stroke: "stroke-success" },
  WARNING: { text: "text-warning", bg: "bg-warning/10", border: "border-warning/40", stroke: "stroke-warning" },
  CRITICAL: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/40", stroke: "stroke-destructive" },
};
