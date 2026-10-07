import type { LiveTelemetry, SystemStatus } from "./types";

/** Frontend-only physics-ish simulation producing correlated EV telemetry. */
export interface EngineState {
  speed: number;
  targetSpeed: number;
  torque: number;
  current: number;
  voltage: number;
  motorT: number;
  battT: number;
  tyre: number;
  soc: number;
  charging: boolean;
}

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const noise = (a: number) => (Math.random() - 0.5) * 2 * a;
const approach = (v: number, target: number, k: number) => v + (target - v) * k;
const CRUISE = [0, 25, 45, 60, 80, 95, 110, 130];

export const initialEngine = (): EngineState => ({
  speed: 48,
  targetSpeed: 60,
  torque: 118,
  current: 64,
  voltage: 392.4,
  motorT: 62,
  battT: 34,
  tyre: 33.4,
  soc: 78,
  charging: false,
});

export function stepEngine(s: EngineState, mode: SystemStatus, wantCharge: boolean): EngineState {
  const n = { ...s };

  if (s.charging) {
    n.speed = 0;
    n.torque = approach(s.torque, 0, 0.5);
    n.current = clamp(approach(s.current, s.soc > 88 ? 60 : 128, 0.25) + noise(1.5), 0, 200);
    n.soc = clamp(s.soc + n.current * 0.0028, 0, 100);
    n.voltage = clamp(approach(s.voltage, 362 + n.soc * 0.78, 0.2) + noise(0.3), 300, 450);
    n.battT = approach(s.battT, 28 + n.current * 0.09, 0.04) + noise(0.05);
    n.motorT = approach(s.motorT, 27, 0.03);
    n.charging = wantCharge && n.soc < 99.5;
  } else {
    let target = s.targetSpeed;
    if (wantCharge) target = 0;
    else if (Math.random() < 0.1) target = CRUISE[Math.floor(Math.random() * CRUISE.length)] ?? 60;
    n.targetSpeed = target;
    n.speed = clamp(approach(s.speed, target, 0.16) + (target > 0 ? noise(0.8) : 0), 0, 160);
    if (n.speed < 0.6) n.speed = 0;
    const accel = n.speed - s.speed;
    const torqueTarget = n.speed === 0 ? 0 : 35 + n.speed * 1.05 + accel * 24;
    n.torque = clamp(approach(s.torque, torqueTarget, 0.5) + noise(4), 0, 400);
    if (n.speed === 0) n.torque = approach(s.torque, 0, 0.6);
    const currentTarget = n.speed === 0 ? 2 : n.torque * 0.36 + n.speed * 0.32;
    n.current = clamp(approach(s.current, currentTarget, 0.45) + noise(2), 0, 200);
    n.soc = clamp(s.soc - n.current * 0.0007, 5, 100);
    n.voltage = clamp(approach(s.voltage, 334 + n.soc * 0.8 - n.current * 0.09, 0.3) + noise(0.4), 300, 450);
    n.motorT = approach(s.motorT, 30 + n.speed * 0.4 + n.torque * 0.06, 0.035) + noise(0.08);
    n.battT = approach(s.battT, 24 + n.current * 0.1, 0.025) + noise(0.04);
    n.charging = wantCharge && n.speed === 0;
  }

  // Demo-state overrides (UI demonstration only)
  n.tyre = approach(s.tyre, mode === "WARNING" ? 24.2 : 33.4, 0.12) + noise(0.04);
  if (mode === "CRITICAL") n.motorT = approach(s.motorT, 114, 0.12);

  n.motorT = clamp(n.motorT, 20, 120);
  n.battT = clamp(n.battT, 20, 65);
  return n;
}

const DIAG: Record<SystemStatus, { diagnosis: string; warnings: string[] }> = {
  NORMAL: { diagnosis: "All systems operating normally", warnings: [] },
  WARNING: { diagnosis: "Low tyre pressure detected", warnings: ["LOW TYRE PRESSURE — rear left below recommended level"] },
  CRITICAL: {
    diagnosis: "High motor temperature",
    warnings: ["HIGH MOTOR TEMPERATURE — reduce load immediately", "Power output limited to protect drivetrain"],
  },
};

export const formatTime = (d: Date) => d.toTimeString().slice(0, 8);

export function toLive(s: EngineState, mode: SystemStatus, now: Date): LiveTelemetry {
  return {
    batteryVoltage: s.voltage,
    batteryCurrent: s.current,
    batteryTemperature: s.battT,
    motorTemperature: s.motorT,
    vehicleSpeed: s.speed,
    motorTorque: s.torque,
    tyrePressure: s.tyre,
    charging: s.charging,
    systemStatus: mode,
    primaryDiagnosis: DIAG[mode].diagnosis,
    activeWarnings: DIAG[mode].warnings,
    rtcTime: formatTime(now),
    monitoringPage: "dashboard",
    source: "mock-simulator",
  };
}
