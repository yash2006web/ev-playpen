import { createFileRoute } from "@tanstack/react-router";
import { TelemetryProvider } from "@/data/telemetry/TelemetryProvider";
import { Header } from "@/components/ev/Header";
import { Hero } from "@/components/ev/Hero";
import { SystemHealth } from "@/components/ev/SystemHealth";
import { Telemetry } from "@/components/ev/Telemetry";
import { VehicleExplorer } from "@/components/ev/VehicleExplorer";
import { Diagnostics, AlertsTimeline } from "@/components/ev/Diagnostics";
import { ChargingPanel } from "@/components/ev/ChargingPanel";
import { PerformanceCharts } from "@/components/ev/PerformanceCharts";
import { HistoricalAnalysis } from "@/components/ev/HistoricalAnalysis";
import { DemoControls, Footer } from "@/components/ev/DemoControls";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EV Monitor — Real-Time Vehicle Telemetry & Diagnostics" },
      { name: "description", content: "Premium real-time EV monitoring dashboard: live telemetry, vehicle health, charging and performance diagnostics." },
      { property: "og:title", content: "EV Monitor — Real-Time Vehicle Telemetry & Diagnostics" },
      { property: "og:description", content: "Live EV telemetry, system health, charging and diagnostics in one command center." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <TelemetryProvider>
      <Header />
      <main>
        <Hero />
        <SystemHealth />
        <Telemetry />
        <VehicleExplorer />
        <Diagnostics />
        <ChargingPanel />
        <PerformanceCharts />
        <HistoricalAnalysis />
        <AlertsTimeline />
      </main>
      <Footer />
      <DemoControls />
    </TelemetryProvider>
  );
}
