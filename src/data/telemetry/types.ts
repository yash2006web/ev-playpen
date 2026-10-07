/**
 * Centralized telemetry contract. Field names mirror the future
 * Firebase Realtime Database object at /EV_Monitoring/live — do not rename.
 */
export type SystemStatus = "NORMAL" | "WARNING" | "CRITICAL";

export interface LiveTelemetry {
  batteryVoltage: number; // V
  batteryCurrent: number; // A
  batteryTemperature: number; // °C
  motorTemperature: number; // °C
  vehicleSpeed: number; // km/h
  motorTorque: number; // Nm
  tyrePressure: number; // PSI
  charging: boolean;
  systemStatus: SystemStatus;
  primaryDiagnosis: string;
  activeWarnings: string[];
  rtcTime: string;
  monitoringPage?: string;
  source?: string;
}

export type SensorKey =
  | "batteryVoltage"
  | "batteryCurrent"
  | "batteryTemperature"
  | "motorTemperature"
  | "vehicleSpeed"
  | "motorTorque"
  | "tyrePressure";

export interface TelemetrySample extends Record<SensorKey, number> {
  t: number;
  time: string;
}

export interface TelemetryEvent {
  id: number;
  time: string;
  kind: "log" | "alert";
  tone: "normal" | "info" | "warning" | "critical";
  title: string;
  detail?: string;
}

/** Values the mock derives for display (not part of the Firebase contract). */
export interface DerivedState {
  soc: number; // battery %
  chargePowerKw: number;
  rangeKm: number;
  health: number; // 0-100
  updatedAt: number;
}
