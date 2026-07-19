import type { ExportRegion } from "./types";

// Exact node positions from Figma dev mode (viewBox 0 0 1400 480).
export const exportRegions: ExportRegion[] = [
  { name: "Центральная Азия", x: 1043, y: 130, anchor: "start" },
  { name: "Восточная Азия", x: 1187, y: 218, anchor: "start" },
  { name: "Закавказье", x: 660, y: 165, anchor: "end" },
  { name: "Америка", x: 255, y: 258, anchor: "end" },
  { name: "Ближний Восток", x: 615, y: 397, anchor: "end" },
  { name: "Южная Азия", x: 850, y: 393, anchor: "end" },
];
