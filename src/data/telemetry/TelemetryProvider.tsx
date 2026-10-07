import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { initialEngine, stepEngine, toLive, formatTime, type EngineState } from "./mockEngine";
import type { DerivedState, LiveTelemetry, SensorKey, SystemStatus, TelemetryEvent, TelemetrySample } from "./types";

/**
 * Single source of telemetry for the UI. To go live, replace the mock
 * interval below with a Firebase onValue() listener on /EV_Monitoring/live
 * that produces the same LiveTelemetry object.
 */
interface TelemetryContextValue {
  live: LiveTelemetry;
  derived: DerivedState;
  history: TelemetrySample[];
  events: TelemetryEvent[];
  mode: SystemStatus;
  setMode: (m: SystemStatus) => void;
  wantCharge: boolean;
  setWantCharge: (v: boolean) => void;
  selectedSensor: SensorKey;
  selectSensor: (k: SensorKey) => void;
}

const Ctx = createContext<TelemetryContextValue | null>(null);
const TICK_MS = 1500;
const HISTORY_MAX = 80;

const sampleOf = (l: LiveTelemetry, t: number): TelemetrySample => ({
  t,
  time: l.rtcTime,
  batteryVoltage: l.batteryVoltage,
  batteryCurrent: l.batteryCurrent,
  batteryTemperature: l.batteryTemperature,
  motorTemperature: l.motorTemperature,
  vehicleSpeed: l.vehicleSpeed,
  motorTorque: l.motorTorque,
  tyrePressure: l.tyrePressure,
});

const healthFor = (mode: SystemStatus, l: LiveTelemetry) => {
  if (mode === "CRITICAL") return 41;
  if (mode === "WARNING") return 78;
  return Math.round(99 - Math.max(0, l.motorTemperature - 70) * 0.1 - Math.max(0, l.batteryTemperature - 40) * 0.1);
};

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const engineRef = useRef<EngineState>(initialEngine());
  const [mode, setModeState] = useState<SystemStatus>("NORMAL");
  const [wantCharge, setWantCharge] = useState(false);
  const modeRef = useRef(mode);
  const chargeRef = useRef(wantCharge);
  modeRef.current = mode;
  chargeRef.current = wantCharge;

  const [live, setLive] = useState<LiveTelemetry>(() => ({ ...toLive(engineRef.current, "NORMAL", new Date(0)), rtcTime: "--:--:--" }));
  const [history, setHistory] = useState<TelemetrySample[]>([]);
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [updatedAt, setUpdatedAt] = useState(0);
  const [selectedSensor, selectSensor] = useState<SensorKey>("motorTemperature");
  const idRef = useRef(1);
  const tickRef = useRef(0);
  const flagsRef = useRef({ highCurrent: false });

  const push = useCallback((e: Omit<TelemetryEvent, "id" | "time">) => {
    setEvents((prev) => [{ ...e, id: idRef.current++, time: formatTime(new Date()) }, ...prev].slice(0, 40));
  }, []);

  const setMode = useCallback(
    (m: SystemStatus) => {
      setModeState((prev) => {
        if (prev === m) return prev;
        if (m === "WARNING") push({ kind: "alert", tone: "warning", title: "Low tyre pressure", detail: "Rear left pressure falling below 26 PSI" });
        else if (m === "CRITICAL") push({ kind: "alert", tone: "critical", title: "High motor temperature", detail: "Motor temperature rising above safe range" });
        else push({ kind: "alert", tone: "normal", title: "Condition recovered", detail: "All systems returned to normal" });
        return m;
      });
    },
    [push],
  );

  useEffect(() => {
    // Backfill a short history so charts are populated immediately.
    const now = Date.now();
    const seed: TelemetrySample[] = [];
    let s = engineRef.current;
    for (let i = 50; i > 0; i--) {
      s = stepEngine(s, "NORMAL", false);
      const d = new Date(now - i * TICK_MS);
      seed.push(sampleOf(toLive(s, "NORMAL", d), d.getTime()));
    }
    engineRef.current = s;
    setHistory(seed);
    setLive(toLive(s, "NORMAL", new Date(now)));
    setUpdatedAt(now);
    push({ kind: "alert", tone: "normal", title: "System normal", detail: "Battery voltage stable" });
    push({ kind: "log", tone: "info", title: "System check completed" });

    const id = window.setInterval(() => {
      const prev = engineRef.current;
      const next = stepEngine(prev, modeRef.current, chargeRef.current);
      engineRef.current = next;
      const nowD = new Date();
      const l = toLive(next, modeRef.current, nowD);
      tickRef.current++;
      setLive(l);
      setUpdatedAt(nowD.getTime());
      setHistory((h) => [...h, sampleOf(l, nowD.getTime())].slice(-HISTORY_MAX));

      if (next.charging && !prev.charging) push({ kind: "alert", tone: "info", title: "Charging started", detail: "Energy flowing into battery pack" });
      if (!next.charging && prev.charging) push({ kind: "alert", tone: "normal", title: "Charging stopped", detail: `Battery at ${next.soc.toFixed(0)}%` });
      if (next.current > 150 && !flagsRef.current.highCurrent && !next.charging) {
        flagsRef.current.highCurrent = true;
        push({ kind: "alert", tone: "warning", title: "High current detected", detail: `Current reached ${next.current.toFixed(0)} A` });
      } else if (next.current < 120 && flagsRef.current.highCurrent) {
        flagsRef.current.highCurrent = false;
        push({ kind: "alert", tone: "normal", title: "Condition recovered", detail: "Current returned to normal" });
      }
      const logs = ["Battery telemetry updated", "Motor telemetry updated", "Tyre sensors polled", "Thermal loop nominal"];
      if (tickRef.current % 2 === 0) push({ kind: "log", tone: "info", title: logs[(tickRef.current / 2) % logs.length] });
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [push]);

  const derived = useMemo<DerivedState>(() => {
    const soc = engineRef.current.soc;
    return {
      soc,
      chargePowerKw: live.charging ? (live.batteryVoltage * live.batteryCurrent) / 1000 : 0,
      rangeKm: soc * 4.0,
      health: healthFor(mode, live),
      updatedAt,
    };
  }, [live, mode, updatedAt]);

  const value = useMemo(
    () => ({ live, derived, history, events, mode, setMode, wantCharge, setWantCharge, selectedSensor, selectSensor }),
    [live, derived, history, events, mode, setMode, wantCharge, selectedSensor],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTelemetry() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useTelemetry must be used inside TelemetryProvider");
  return v;
}
