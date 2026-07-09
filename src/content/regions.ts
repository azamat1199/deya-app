import type { ExportRegion } from "./types";

// Coordinates approximate the reference diagram's asymmetric layout
// (a connection network, not a symmetric radial map).
export const exportRegions: ExportRegion[] = [
  { name: "Центральная Азия", x: 680, y: 90 },
  { name: "Закавказье", x: 430, y: 140 },
  { name: "Восточная Азия", x: 800, y: 190 },
  { name: "Америка", x: 110, y: 230 },
  { name: "Южная Азия", x: 490, y: 380 },
  { name: "Ближний Восток", x: 330, y: 360 },
];
