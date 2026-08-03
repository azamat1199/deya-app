import type { ExportMapConfig } from "./types";

// Three hand-tuned coordinate sets, one per breakpoint. Do NOT stretch one set
// with CSS: the SVG box ratio and the viewBox ratio must always be identical
// (preserveAspectRatio="meet" letterboxes otherwise), so a single set forced
// into three different container ratios would either distort or leave dead
// space. Shipping three sets also lets each layout keep its labels legible.
//
// Label offsets are chosen so no label ever crosses a spoke. Worst case for
// collisions is the *narrow* end of each breakpoint's range: labels are
// counter-scaled to a constant on-screen size, so they occupy the most viewBox
// units when the SVG renders smaller than its viewBox width.

// Desktop (>= lg / 1200px). viewBox matches the Figma frame exactly: 1321x377.
export const exportMapDesktop: ExportMapConfig = {
  viewBox: "0 0 1321 377",
  fontSize: 13,
  dotRadius: 5,
  // Hub label sits *below* the hub: at +4 it collided with the spoke running
  // up-right to East Asia.
  factory: { label: "ФАБРИКА DEYA", x: 947, y: 200, anchor: "start", labelDx: 12, labelDy: 20 },
  regions: [
    { id: "central-asia", label: "ЦЕНТРАЛЬНАЯ АЗИЯ", x: 990, y: 48, anchor: "start", labelDx: 8, labelDy: 16 },
    // Pulled in from the right edge: at 1200px this label needs ~124 viewBox
    // units and would otherwise run past the 1321-unit frame.
    { id: "east-asia", label: "ВОСТОЧНАЯ АЗИЯ", x: 1160, y: 140, anchor: "start", labelDx: 8, labelDy: 16 },
    { id: "transcaucasia", label: "ЗАКАВКАЗЬЕ", x: 440, y: 80, anchor: "end", labelDx: -8, labelDy: 16 },
    { id: "america", label: "АМЕРИКА", x: 66, y: 168, anchor: "start", labelDx: -6, labelDy: 22 },
    { id: "south-asia", label: "ЮЖНАЯ АЗИЯ", x: 705, y: 325, anchor: "end", labelDx: -8, labelDy: 22 },
    { id: "middle-east", label: "БЛИЖНИЙ ВОСТОК", x: 385, y: 332, anchor: "start", labelDx: -6, labelDy: 24 },
  ],
};

// Tablet (md 768px – lg 1200px). 3.5:1 at 768px wide is only ~220px tall, which
// squeezes six labels into a band they cannot share; 9:5 buys back the height.
export const exportMapTablet: ExportMapConfig = {
  viewBox: "0 0 900 500",
  fontSize: 12,
  dotRadius: 5,
  factory: { label: "ФАБРИКА DEYA", x: 630, y: 250, anchor: "start", labelDx: 12, labelDy: 22 },
  regions: [
    { id: "central-asia", label: "ЦЕНТРАЛЬНАЯ АЗИЯ", x: 700, y: 70, anchor: "start", labelDx: 8, labelDy: -12 },
    // Pushed right so the label starts past x=700: the hub→Central Asia spoke
    // occupies x 630–700, and at 768px this label is wide enough to reach back
    // into it.
    { id: "east-asia", label: "ВОСТОЧНАЯ АЗИЯ", x: 790, y: 190, anchor: "end", labelDx: 75, labelDy: -14 },
    { id: "transcaucasia", label: "ЗАКАВКАЗЬЕ", x: 300, y: 105, anchor: "end", labelDx: -10, labelDy: 4 },
    { id: "america", label: "АМЕРИКА", x: 60, y: 225, anchor: "start", labelDx: -6, labelDy: -14 },
    { id: "south-asia", label: "ЮЖНАЯ АЗИЯ", x: 480, y: 430, anchor: "end", labelDx: -10, labelDy: 6 },
    { id: "middle-east", label: "БЛИЖНИЙ ВОСТОК", x: 260, y: 450, anchor: "start", labelDx: -6, labelDy: 22 },
  ],
};

// Mobile portrait (< md / 768px). The desktop composition compressed into a
// near-square: hub middle-right, spokes radiating in every direction. The
// wrapper's aspect-ratio must stay 38/35 to match this viewBox.
export const exportMapMobile: ExportMapConfig = {
  viewBox: "0 0 380 350",
  // 9, not 10: at 360px "ВОСТОЧНАЯ АЗИЯ" is 119 of the 380 frame units at
  // size 10, and the hub→Central Asia spoke crosses its row at x≈264 — there
  // is no labelDx that fits 119 units between 264 and the 380 edge.
  fontSize: 9,
  dotRadius: 4,
  factory: { label: "ФАБРИКА DEYA", x: 252, y: 202, anchor: "start", labelDx: 10, labelDy: 12 },
  regions: [
    { id: "central-asia", label: "ЦЕНТРАЛЬНАЯ АЗИЯ", x: 284, y: 26, anchor: "middle", labelDx: 0, labelDy: -13 },
    { id: "transcaucasia", label: "ЗАКАВКАЗЬЕ", x: 155, y: 100, anchor: "middle", labelDx: 0, labelDy: -14 },
    // +2 clears the hub→Central Asia spoke on the left; below the dot instead
    // would land it on its own hub→East Asia spoke.
    { id: "east-asia", label: "ВОСТОЧНАЯ АЗИЯ", x: 320, y: 158, anchor: "middle", labelDx: 2, labelDy: -13 },
    // Only 51 units of frame sit left of this dot but the label needs ~64 at
    // 360px, so it moves up and right of the node instead of left of it.
    { id: "america", label: "АМЕРИКА", x: 57, y: 167, anchor: "end", labelDx: 14, labelDy: -8 },
    { id: "south-asia", label: "ЮЖНАЯ АЗИЯ", x: 227, y: 257, anchor: "middle", labelDx: -9, labelDy: 15 },
    { id: "middle-east", label: "БЛИЖНИЙ ВОСТОК", x: 39, y: 315, anchor: "start", labelDx: 0, labelDy: 14 },
  ],
};
