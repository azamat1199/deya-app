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
import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "framer-motion";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ScrollReveal from "@/components/ui/ScrollReveal";
import {
  EXPORT_REGION_API_IDS,
  exportMapDesktop,
  exportMapMobile,
  exportMapTablet,
} from "@/content/regions";
import { homeContent } from "@/content/home";
import type {
  ExportMapConfig,
  ExportRegionSlug,
  MapPoint,
} from "@/content/types";
import type { TranslationKey } from "@/lib/i18n/dictionary";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Loaded on demand: this form lives inside a Modal that only mounts when the
// user opens it, and it is the entry point to libphonenumber-js's metadata and
// react-hook-form. Importing it statically put both on the critical path of a
// page where no phone field is ever shown. Measured, not assumed — see the
// optimization report.
const PartnerForm = dynamic(() => import("@/components/forms/PartnerForm"), {
  ssr: false,
});

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
      shown: {
        scale: 1,
        opacity: 1,
        transition: { duration: d(POINT_DURATION) },
      },
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
  config: LabelledMapConfig;
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
  const { t } = useTranslation();
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
        {t("home.exportMap.factoryLabel")}
      </motion.text>
    </motion.svg>
  );
}

/** A marker as drawn: its geometry plus the label resolved for this locale. */
type LabelledPoint = MapPoint & { label: string };
type LabelledMapConfig = Omit<ExportMapConfig, "regions"> & {
  regions: LabelledPoint[];
};

const CYRILLIC = /[\u0400-\u04FF]/;

const MARKER_SLUGS = Object.keys(EXPORT_REGION_API_IDS) as ExportRegionSlug[];
const KNOWN_API_IDS = new Set(Object.values(EXPORT_REGION_API_IDS));

interface RegionLabels {
  labels: Record<ExportRegionSlug, string>;
  /** Markers whose API id is absent from a non-empty response. */
  orphanMarkers: string[];
  /** API regions whose id no marker claims. */
  unusedRegions: string[];
  /** Markers with neither an API name nor a dictionary entry. */
  slugLabels: ExportRegionSlug[];
}

/**
 * One label per marker, resolved once for all three breakpoints. API regions
 * are matched to markers BY ID through EXPORT_REGION_API_IDS — never by name,
 * which is translated per locale. Per marker, the first non-empty of:
 *
 *   1. the API's name for this id, in the active locale
 *   2. the dictionary's home.exportMap.regions.<slug>
 *   3. the slug itself, reported, so a marker is never left blank
 *
 * The API's name is skipped on /uz and /en when it is Cyrillic: the backend
 * answers an unfilled uz/en field with the Russian value rather than with "",
 * so a Cyrillic name there means "not translated yet", and the dictionary has
 * the better label. The site's Uzbek is Latin-script throughout.
 *
 * An empty `regions` (empty section or failed request) simply sends every
 * marker to step 2; the page already logs that case. API regions with no
 * marker never add one.
 */
function resolveRegionLabels(
  regions: ExportRegion[],
  locale: string,
  t: (key: TranslationKey) => string,
): RegionLabels {
  const nameById = new Map(regions.map((region) => [region.id, region.name]));
  const labels = {} as Record<ExportRegionSlug, string>;
  const orphanMarkers: string[] = [];
  const slugLabels: ExportRegionSlug[] = [];

  for (const slug of MARKER_SLUGS) {
    const apiId = EXPORT_REGION_API_IDS[slug];
    if (regions.length > 0 && !nameById.has(apiId)) {
      orphanMarkers.push(`${slug} (id=${apiId})`);
    }

    let apiName = nameById.get(apiId)?.trim() ?? "";
    if (locale !== "ru" && CYRILLIC.test(apiName)) apiName = "";

    const key: TranslationKey = `home.exportMap.regions.${slug}`;
    const dictionaryLabel = t(key);
    const fallback = dictionaryLabel !== key ? dictionaryLabel.trim() : "";

    labels[slug] = apiName || fallback || slug;
    if (!apiName && !fallback) slugLabels.push(slug);
  }

  return {
    labels,
    orphanMarkers,
    unusedRegions: regions
      .filter((region) => !KNOWN_API_IDS.has(region.id))
      .map((region) => `${region.name} (id=${region.id})`),
    slugLabels,
  };
}

/** Puts the resolved labels on one breakpoint's markers. Coordinates, offsets,
 *  anchors, ordering and the marker set itself are untouched — and the API's
 *  position_x/position_y (always "1.00") are deliberately never read. */
function withLabels(
  config: ExportMapConfig,
  labels: Record<ExportRegionSlug, string>,
): LabelledMapConfig {
  return {
    ...config,
    regions: config.regions.map((region) => ({
      ...region,
      label: labels[region.id],
    })),
  };
}

/** Only what the labels need. Coordinates are the map's own. */
export interface ExportRegion {
  id: number;
  name: string;
}

export interface ExportMapProps {
  /** From GET /api/v1/home/ `export_regions[]`. Matched to markers by id. An
   *  empty array — whether the section is genuinely empty or the request
   *  failed — puts every marker on its dictionary label; see
   *  resolveRegionLabels. */
  regions: ExportRegion[];
  /**
   * The heading, from GET /api/v1/banners/ type "sub_main_map" (the type name
   * does not describe the content; see lib/mainText.ts). "" when the CMS has
   * nothing for the active locale, and the static copy stands in.
   *
   * Carries real "\n" characters — the h2 below is `whitespace-pre-line`, so
   * the authored line breaks are what shape it. Passing it through a prop does
   * not touch them.
   */
  headingText?: string;
}

export default function ExportMap({ regions, headingText }: ExportMapProps) {
  const { t, locale } = useTranslation();
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

  // Labels are resolved once and shared: all three breakpoints carry the same
  // six markers. See resolveRegionLabels.
  const { labels, orphanMarkers, unusedRegions, slugLabels } = useMemo(
    () => resolveRegionLabels(regions, locale, t),
    [regions, locale, t],
  );

  // One overlay per breakpoint config. Labels only — see withLabels.
  const desktopConfig = useMemo(
    () => withLabels(exportMapDesktop, labels),
    [labels],
  );
  const tabletConfig = useMemo(
    () => withLabels(exportMapTablet, labels),
    [labels],
  );
  const mobileConfig = useMemo(
    () => withLabels(exportMapMobile, labels),
    [labels],
  );

  // Reported from an effect rather than during render, so a re-render cannot
  // repeat it. All three are warn, NOT error: each is a CMS data-entry issue
  // the map already survives (the marker falls back to its dictionary label),
  // and console.error trips the Next dev error overlay on every page load.
  useEffect(() => {
    if (orphanMarkers.length > 0) {
      console.warn(
        `[ExportMap] ${orphanMarkers.length} marker(s) have no export_region with their id and show the dictionary label: ${orphanMarkers.join(", ")} — restore these ids in the CMS or update EXPORT_REGION_API_IDS.`,
      );
    }
    if (unusedRegions.length > 0) {
      console.warn(
        `[ExportMap] ${unusedRegions.length} export_region(s) match no marker on the map and are not rendered: ${unusedRegions.join(", ")}.`,
      );
    }
    if (slugLabels.length > 0) {
      console.warn(
        `[ExportMap] ${slugLabels.length} marker(s) have no API name and no dictionary label on /${locale}, showing the slug: ${slugLabels.join(", ")} — add home.exportMap.regions.<slug> to the locale file.`,
      );
    }
  }, [orphanMarkers, unusedRegions, slugLabels, locale]);

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
        <ScrollReveal
          direction="up"
          className="lg:[grid-area:1/1] lg:self-start"
        >
          {/* 22px is the largest size at which all four authored lines still
              fit unwrapped in a 360px viewport. 34ch from lg is what keeps the
              longest authored line ("и вкус в более чем 25 стран", 27 chars)
              from wrapping, so the heading stays exactly four lines. */}
          <h2 className="relative z-10 max-w-120 text-[1.375rem] leading-tight font-light whitespace-pre-line text-ink-900 md:text-3xl lg:max-w-[34ch] lg:text-4xl lg:leading-(--h2-line-height) xl:text-5xl">
            {headingText || homeContent.exportMap.heading}
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
                <li>{t("home.exportMap.factoryLabel")}</li>
                {desktopConfig.regions.map((region) => (
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
                config={mobileConfig}
                className="h-full w-full overflow-visible"
                {...svgMotionProps}
              />
            </div>
            <div className="hidden aspect-9/5 w-full md:block lg:hidden">
              <MapSvg
                config={tabletConfig}
                className="h-full w-full overflow-visible"
                {...svgMotionProps}
              />
            </div>
            {/* aspect-1321/377 is exportMapDesktop's viewBox verbatim. Width
                (and therefore the right edge) comes from the layer above, which
                is anchored to the container's right edge. */}
            <div className="hidden aspect-1321/377 w-full lg:block">
              <MapSvg
                config={desktopConfig}
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
