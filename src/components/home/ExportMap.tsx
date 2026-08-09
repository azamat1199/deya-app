"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";
import Image from "next/image";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";

import PartnerForm from "@/components/forms/PartnerForm";
import { Button, Modal, ScrollReveal } from "@/components/ui";
import {
  exportMapDesktop,
  exportMapMobile,
  exportMapTablet,
} from "@/content/regions";
import { homeContent } from "@/content/home";
import type { ExportMapConfig } from "@/content/types";
import { useTranslation } from "@/lib/i18n/useTranslation";

const LINE_DURATION = 1.1;
/** Gap between consecutive spokes starting to draw. */
const LINE_STAGGER = 0.09;
const POINT_DURATION = 0.4;
const LABEL_DURATION = 0.5;

/** A mid-layout measurement (a container that is briefly 0-ish or huge) would
 * otherwise feed `fontSize / scale` an extreme divisor and blow the labels up. */
const SCALE_MIN = 0.35;
const SCALE_MAX = 3;
/** ResizeObserver fires on sub-pixel changes; below this delta the re-render
 * would not move a single glyph. */
const SCALE_EPSILON = 0.001;

/** useLayoutEffect warns during SSR, but we need pre-paint measurement on the
 * client so the first frame isn't drawn with wrong-sized labels. */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

interface MapVariants {
  line: Variants;
  point: Variants;
  label: Variants;
  hub: Variants;
  hubLabel: Variants;
}

/** Explicit "hidden"/"shown" states rather than `animate={cond ? {...} : undefined}`
 * — with `undefined` the element is left sitting on its `initial` (opacity 0)
 * with no target to return to if the trigger never resolves.
 * `instant` collapses every duration and delay to 0 for reduced motion. */
function buildVariants(instant: boolean): MapVariants {
  const d = (seconds: number) => (instant ? 0 : seconds);

  return {
    line: {
      hidden: { pathLength: 0, opacity: 0 },
      shown: (i: number) => ({
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: d(LINE_DURATION),
          ease: "easeInOut",
          delay: d(i * LINE_STAGGER),
        },
      }),
    },
    // Dots and labels key off their own spoke's index, so each destination
    // resolves as its line arrives instead of all six landing together.
    point: {
      hidden: { scale: 0, opacity: 0 },
      shown: (i: number) => ({
        scale: 1,
        opacity: 1,
        transition: {
          duration: d(POINT_DURATION),
          delay: d(i * LINE_STAGGER + LINE_DURATION * 0.8),
        },
      }),
    },
    label: {
      hidden: { opacity: 0 },
      shown: (i: number) => ({
        opacity: 1,
        transition: {
          duration: d(LABEL_DURATION),
          delay: d(i * LINE_STAGGER + LINE_DURATION * 0.9),
        },
      }),
    },
    hub: {
      hidden: { scale: 0, opacity: 0 },
      shown: { scale: 1, opacity: 1, transition: { duration: d(POINT_DURATION) } },
    },
    hubLabel: {
      hidden: { opacity: 0 },
      shown: { opacity: 1, transition: { duration: d(LABEL_DURATION) } },
    },
  };
}

/** Live scale factor between viewBox units and rendered CSS pixels. Mirrors
 * how preserveAspectRatio="meet" fits the viewBox inside the element. */
function useViewBoxScale(
  ref: RefObject<SVGSVGElement | null>,
  vbWidth: number,
  vbHeight: number,
) {
  const [scale, setScale] = useState(1);

  useIsomorphicLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;

    function update() {
      if (!element) return;
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      const next = clamp(
        Math.min(width / vbWidth, height / vbHeight),
        SCALE_MIN,
        SCALE_MAX,
      );
      setScale((prev) => (Math.abs(prev - next) < SCALE_EPSILON ? prev : next));
    }

    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, vbWidth, vbHeight]);

  return scale;
}

interface MapSvgProps {
  config: ExportMapConfig;
  variants: MapVariants;
  /** `false` mounts straight into the final state (reduced motion), avoiding
   * the one-frame flash of a hidden map. */
  initial: false | "hidden";
  animate: "hidden" | "shown";
  className: string;
}

// A single responsive SVG: lines, dots and labels all live in the same viewBox
// coordinate space, so they can never detach from each other at any screen
// size. Text *and* dot radius are counter-scaled by the live render scale so
// both hold a constant on-screen size instead of growing on wide monitors.
function MapSvg({
  config,
  variants,
  initial,
  animate,
  className,
}: MapSvgProps) {
  const { viewBox, factory, regions, fontSize, dotRadius } = config;
  const svgRef = useRef<SVGSVGElement>(null);
  const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);
  const scale = useViewBoxScale(svgRef, vbWidth, vbHeight);

  // Counter-scale so `fontSize`/`dotRadius` read as targets in on-screen pixels.
  const labelFontSize = fontSize / scale;
  const labelLetterSpacing = 0.5 / scale;
  const pointRadius = dotRadius / scale;
  const hubRadius = (dotRadius + 1) / scale;
  // Counter-scaled rather than vectorEffect="non-scaling-stroke": that keyword
  // resolves the dash pattern in screen space while framer-motion's pathLength
  // normalises in user space, and the mismatch truncates every line by the
  // scale factor so it never reaches its dot.
  const strokeWidth = 1 / scale;

  const hubAnchor = factory.anchor ?? "start";
  const hubLabelX = factory.x + (factory.labelDx ?? 10);
  const hubLabelY = factory.y + (factory.labelDy ?? 4);

  return (
    <motion.svg
      ref={svgRef}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      // All three breakpoint SVGs are mounted at once (CSS hides two), so a
      // role="img" here would announce the map three times over. The graphic is
      // described once by the sr-only list in the parent instead.
      aria-hidden="true"
      focusable="false"
      initial={initial}
      animate={animate}
    >
      {regions.map((region, i) => (
        <motion.line
          key={region.id}
          x1={factory.x}
          y1={factory.y}
          x2={region.x}
          y2={region.y}
          stroke="var(--color-ink-900)"
          strokeWidth={strokeWidth}
          variants={variants.line}
          custom={i}
        />
      ))}

      {regions.map((region, i) => (
        <motion.circle
          key={region.id}
          cx={region.x}
          cy={region.y}
          r={pointRadius}
          fill="var(--color-brand-600)"
          variants={variants.point}
          custom={i}
          // A px transform-origin on an SVG shape is unreliable in Safari;
          // fill-box + center resolves against the shape's own bounding box.
          style={{ transformBox: "fill-box", transformOrigin: "center" }}
        />
      ))}
      <motion.circle
        cx={factory.x}
        cy={factory.y}
        r={hubRadius}
        fill="var(--color-brand-600)"
        variants={variants.hub}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
      />

      {regions.map((region, i) => (
        <motion.text
          key={region.id}
          x={region.x + (region.labelDx ?? 0)}
          y={region.y + (region.labelDy ?? 0)}
          textAnchor={region.anchor}
          fontSize={labelFontSize}
          fill="var(--color-ink-900)"
          letterSpacing={labelLetterSpacing}
          className="font-medium uppercase"
          variants={variants.label}
          custom={i}
        >
          {region.label}
        </motion.text>
      ))}
      <motion.text
        x={hubLabelX}
        y={hubLabelY}
        textAnchor={hubAnchor}
        fontSize={labelFontSize}
        fill="var(--color-brand-600)"
        letterSpacing={labelLetterSpacing}
        className="font-medium uppercase"
        variants={variants.hubLabel}
      >
        {factory.label}
      </motion.text>
    </motion.svg>
  );
}

export default function ExportMap() {
  const { t } = useTranslation();
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const diagramRef = useRef<HTMLDivElement>(null);
  const inView = useInView(diagramRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  // useInView never fires without IntersectionObserver support, which would
  // strand the map in its "hidden" state; reveal it immediately in that case.
  const [inViewUnavailable, setInViewUnavailable] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver !== "undefined") return;
    const id = window.setTimeout(() => setInViewUnavailable(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const shouldAnimate =
    Boolean(prefersReducedMotion) || inView || inViewUnavailable;

  const variants = useMemo(
    () => buildVariants(Boolean(prefersReducedMotion)),
    [prefersReducedMotion],
  );

  const svgMotionProps = {
    variants,
    initial: prefersReducedMotion ? (false as const) : ("hidden" as const),
    animate: shouldAnimate ? ("shown" as const) : ("hidden" as const),
  };

  return (
    <div>
      {/* Overlap stage. A one-cell grid rather than absolute positioning: both
          children claim [grid-area:1/1] at lg+ so they stack, and the cell
          still auto-sizes to the taller of the two — no hand-reserved height,
          and a heading that wraps to a fifth line just grows the section.
          Below lg the same grid falls back to two auto rows, i.e. the stacked
          heading → map order.
          --h2-line-height is the single source for both the h2's leading and
          the map's top offset, so the "map starts at the heading's third line"
          relationship survives any type-scale change. */}
      <div className="grid pt-16 lg:pt-24 lg:[--h2-line-height:2.8125rem] xl:[--h2-line-height:3.75rem]">
        <ScrollReveal direction="up" className="lg:[grid-area:1/1] lg:self-start">
          {/* 22px is the largest size at which all four authored lines still
              fit unwrapped in a 360px viewport. 34ch from lg is what keeps the
              longest authored line ("и вкус в более чем 25 стран", 27 chars)
              from wrapping, so the heading stays exactly four lines. */}
          <h2 className="relative z-10 max-w-120 text-[1.375rem] leading-tight font-light whitespace-pre-line text-ink-900 md:text-3xl lg:max-w-[34ch] lg:text-4xl lg:leading-(--h2-line-height) xl:text-5xl">
            {homeContent.exportMap.heading}
          </h2>
        </ScrollReveal>

        <ScrollReveal
          direction="up"
          // min-w floor: the labels are counter-scaled to a constant on-screen
          // size, so the narrower the map renders the more viewBox units they
          // occupy. Below ~1120px of render width ВОСТОЧНАЯ АЗИЯ outgrows the
          // 1321-unit frame, so at 1200–1230 the map takes the full container
          // instead of 91% of it.
          className="mt-10 lg:mt-[calc(2*var(--h2-line-height))] lg:ml-auto lg:w-[91%] lg:min-w-[70rem] lg:[grid-area:1/1]"
        >
          <div ref={diagramRef}>
            {/* One sr-only description for the whole diagram, since the three
                SVGs below are decorative duplicates of each other. */}
            <div className="sr-only">
              <p>{t("home.exportMap.mapLabel")}</p>
              <ul>
                <li>{exportMapDesktop.factory.label}</li>
                {exportMapDesktop.regions.map((region) => (
                  <li key={region.id}>{region.label}</li>
                ))}
              </ul>
            </div>

            {/* Every container's aspect-ratio is its config's viewBox ratio, so
                preserveAspectRatio="meet" never letterboxes. Width is capped
                instead of height: a max-h with a fixed aspect-ratio shrinks the
                box from both sides and leaves dead space left and right. */}
            <div className="aspect-38/35 w-full md:hidden">
              <MapSvg
                config={exportMapMobile}
                className="h-full w-full overflow-visible"
                {...svgMotionProps}
              />
            </div>
            <div className="hidden aspect-9/5 w-full md:block lg:hidden">
              <MapSvg
                config={exportMapTablet}
                className="h-full w-full overflow-visible"
                {...svgMotionProps}
              />
            </div>
            {/* aspect-1321/377 is exportMapDesktop's viewBox verbatim. Width
                (and therefore the right edge) comes from the layer above, which
                is anchored to the container's right edge. */}
            <div className="hidden aspect-1321/377 w-full lg:block">
              <MapSvg
                config={exportMapDesktop}
                className="h-full w-full overflow-visible"
                {...svgMotionProps}
              />
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal direction="fade">
        <div className="relative left-1/2 mt-12 w-screen -translate-x-1/2 lg:mt-16">
          <div className="relative aspect-1200/620 overflow-hidden">
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-10 h-24"
              style={{
                background:
                  "linear-gradient(180deg, var(--color-cream-50) 30.77%, var(--color-cream-50-0) 77.4%)",
              }}
              aria-hidden="true"
            />
            <Image
              src={homeContent.exportMap.truckStripImage}
              alt={t("home.exportMap.truckAlt")}
              fill
              sizes="100vw"
              className="object-cover"
            />
            <Button
              variant="white"
              size="md"
              // Stretched between two insets rather than given w-full: the
              // button is absolutely positioned inside a full-bleed frame, so
              // w-full would resolve to the frame's whole width and run past
              // the right edge. With width auto and both left and right set,
              // the used width is frame - 20 - 20, which puts its edges on the
              // logo and the burger. 5 is the same step .container-page uses
              // for px-5, so the two move together.
              className="absolute bottom-4 left-4 z-20 shadow-md max-md:right-5 max-md:left-5 max-md:w-auto lg:bottom-12 lg:left-16 lg:px-10 lg:py-4 cursor-pointer"
              onClick={() => setIsPartnerFormOpen(true)}
            >
              {t("buttons.becomePartner")}
            </Button>
          </div>
        </div>
      </ScrollReveal>

      <Modal
        isOpen={isPartnerFormOpen}
        onClose={() => setIsPartnerFormOpen(false)}
        title={t("home.exportMap.modalTitle")}
      >
        <PartnerForm onSuccess={() => setIsPartnerFormOpen(false)} />
      </Modal>
    </div>
  );
}
