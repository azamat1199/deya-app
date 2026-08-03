"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";

import { historySlides } from "@/content/history";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";

const FADE_EASE = [0.4, 0, 0.2, 1] as const;
const IMAGE_FADE_S = 0.7;
/** Copy settles before the photo does. */
const TEXT_FADE_S = 0.55;

/** Gap from the year baselines down to the rule the dots sit on. */
const RULE_BELOW_BASELINE_PX = 22;
const PANEL_ID = "history-panel";
const tabId = (year: string) => `history-year-${year}`;

const LAST_INDEX = historySlides.length - 1;

/**
 * Which years render large. The selected one, plus 2026 — the timeline's open
 * end keeps its emphasis whether or not it is the year on screen. 1994 has no
 * such standing: it is large only while selected.
 */
const isEmphasised = (index: number, activeIndex: number) =>
  index === activeIndex || index === LAST_INDEX;

// ---------------------------------------------------------------------------
// Mobile-only (< 768px). Everything below this line is inert at >= md: the JS
// is gated on `isMobileRef`, and the classes it drives all carry `max-md:`.
// ---------------------------------------------------------------------------

// 767.98 rather than 767: matchMedia works in CSS pixels, which are fractional
// on a zoomed or scaled viewport, so `max-width: 767px` would leave a dead band
// at 767.5 where neither this nor Tailwind's `md:` is active.
const MOBILE_QUERY = "(max-width: 767.98px)";
/** Extra viewport-heights of scroll per year, past the pinned first screen. */
const MOBILE_STEP_SVH = 40;
const MOBILE_TRACK_SVH = 100 + LAST_INDEX * MOBILE_STEP_SVH;
/** Escape hatch: a smooth scroll the user interrupts never reaches its target. */
const PROGRAMMATIC_SCROLL_TIMEOUT_MS = 1500;

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function HistoryHero() {
  const { t } = useTranslation();
  const prefersReducedMotion = useReducedMotion();
  const instant = Boolean(prefersReducedMotion);

  const [activeIndex, setActiveIndex] = useState(0);
  const active = historySlides[activeIndex];

  const trackRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Mirrored into a ref as well as state: the ref is what the scroll and click
  // handlers read (they must not re-subscribe when it flips), the state is only
  // there to swap aria-orientation, which is not a rendering concern.
  const [isMobile, setIsMobile] = useState(false);
  const isMobileRef = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const sync = () => {
      isMobileRef.current = mq.matches;
      setIsMobile(mq.matches);
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // The dot layer is measured, not assumed: neither the shared text baseline
  // nor the per-year centres can be expressed in CSS. `baseline` is the offset
  // from a label's own top down to its baseline, which the scale()
  // transform-origin needs — computed rather than derived from Roboto's
  // published ascender, because the browser resolves `line-height: normal` from
  // the win metrics, not the typo ones, and the two differ by ~5px at 36px.
  const [metrics, setMetrics] = useState<{
    top: number;
    baseline: number;
    centres: number[];
  }>({
    top: 0,
    baseline: 0,
    centres: [],
  });

  useIsomorphicLayoutEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    function measure() {
      const first = tabRefs.current[0];
      const last = tabRefs.current[historySlides.length - 1];
      const yearEl = first?.querySelector<HTMLElement>("[data-year]");
      if (!row || !first || !last || !yearEl) return;

      // A zero-size inline-block with vertical-align:baseline sits exactly ON
      // the text baseline — the only reliable way to read it from the DOM.
      const probe = document.createElement("span");
      probe.style.cssText =
        "display:inline-block;width:0;height:0;vertical-align:baseline";
      yearEl.appendChild(probe);
      // offsetTop, not getBoundingClientRect: inactive labels carry a scale(),
      // and a client rect would report the *painted* baseline rather than the
      // layout one, dragging the rule up and down as the selection moves.
      // Both offsets are already relative to a positioned ancestor — the probe
      // to its button, the button to the row.
      const baselineInButton = probe.offsetTop;
      probe.remove();

      const top = first.offsetTop + baselineInButton + RULE_BELOW_BASELINE_PX;
      const baseline = baselineInButton - yearEl.offsetTop;
      const centres = tabRefs.current.map((tab) =>
        tab ? tab.offsetLeft + tab.offsetWidth / 2 : 0,
      );
      setMetrics((prev) =>
        Math.abs(prev.top - top) < 0.5 &&
        Math.abs(prev.baseline - baseline) < 0.5 &&
        prev.centres.length === centres.length &&
        centres.every((c, i) => Math.abs(prev.centres[i] - c) < 0.5)
          ? prev
          : { top, baseline, centres },
      );
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(row);
    return () => observer.disconnect();
  }, [activeIndex]);

  // Centre the active year in a horizontally scrolling strip by writing
  // scrollLeft directly. scrollIntoView() would be shorter but it can also
  // scroll the *page*. Below md the strip is a static column — and its
  // scrollWidth reads over its clientWidth there only because the dots hang
  // half their width past the rail's edge, which is not something to scroll to.
  useEffect(() => {
    const strip = stripRef.current;
    const tab = tabRefs.current[activeIndex];
    if (!strip || !tab || isMobileRef.current) return;
    if (strip.scrollWidth <= strip.clientWidth) return;

    strip.scrollTo({
      left: tab.offsetLeft - (strip.clientWidth - tab.clientWidth) / 2,
      behavior: instant ? "auto" : "smooth",
    });
  }, [activeIndex, instant]);

  // --- mobile: scroll position drives the active year --------------------
  // The hero is pinned inside a tall track; progress through that track maps
  // onto the year list. At >= md the track collapses to the section's own
  // height, so the range is zero and this never fires.
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // While a click or arrow key is smooth-scrolling the page, the intermediate
  // years must not flash past — the target index is parked here and every other
  // reading ignored until the scroll lands on it.
  const pendingIndexRef = useRef<number | null>(null);
  const pendingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
    },
    [],
  );

  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    if (!isMobileRef.current) return;
    const next = Math.min(
      LAST_INDEX,
      Math.max(0, Math.round(progress * LAST_INDEX)),
    );
    if (pendingIndexRef.current !== null) {
      if (next !== pendingIndexRef.current) return;
      pendingIndexRef.current = null;
    }
    setActiveIndex((prev) => (prev === next ? prev : next));
  });

  /**
   * Mobile: move the page to the slice of the track that owns `index`, so a
   * click and the scroll position can never disagree. Returns false at >= md,
   * where there is no track to travel through.
   */
  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!isMobileRef.current || !track) return false;
      const rect = track.getBoundingClientRect();
      const span = rect.height - window.innerHeight;
      if (span <= 0) return false;

      pendingIndexRef.current = index;
      if (pendingTimerRef.current) clearTimeout(pendingTimerRef.current);
      pendingTimerRef.current = setTimeout(() => {
        pendingIndexRef.current = null;
      }, PROGRAMMATIC_SCROLL_TIMEOUT_MS);

      window.scrollTo({
        top: rect.top + window.scrollY + (index / LAST_INDEX) * span,
        behavior: instant ? "auto" : "smooth",
      });
      return true;
    },
    [instant],
  );

  const selectIndex = useCallback(
    (index: number) => {
      setActiveIndex(index);
      scrollToIndex(index);
    },
    [scrollToIndex],
  );

  // Roving tabindex: arrows move and activate, Home/End jump to the ends.
  // The next index is computed from `activeIndex` directly — deriving it inside
  // a setState updater would leave it unavailable to the .focus() call below,
  // which desynced focus from selection after the first keypress.
  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      const last = LAST_INDEX;
      // Up/Down move only while the timeline is the vertical mobile rail. On
      // the horizontal desktop tablist ARIA reserves them for the page, so they
      // are left alone there.
      const vertical = isMobileRef.current;
      const { key } = event;
      let next: number;

      if (key === "ArrowRight" || (vertical && key === "ArrowDown")) {
        next = activeIndex === last ? 0 : activeIndex + 1;
      } else if (key === "ArrowLeft" || (vertical && key === "ArrowUp")) {
        next = activeIndex === 0 ? last : activeIndex - 1;
      } else if (key === "Home") {
        next = 0;
      } else if (key === "End") {
        next = last;
      } else {
        return;
      }

      event.preventDefault();
      selectIndex(next);
      tabRefs.current[next]?.focus();
    },
    [activeIndex, selectIndex],
  );

  return (
    // Mobile scroll track. Below md the hero is pinned inside a column tall
    // enough to give every year its own slice of scroll; at >= md both wrappers
    // are unstyled block boxes, so the section lays out exactly as before.
    <div
      ref={trackRef}
      className="max-md:h-(--track-h)"
      style={{ "--track-h": `${MOBILE_TRACK_SVH}svh` } as React.CSSProperties}
    >
      <div className="max-md:sticky max-md:top-0 max-md:h-svh max-md:supports-[height:100dvh]:h-dvh">
        <section className="relative w-full overflow-hidden bg-ink-900 text-white h-svh supports-[height:100dvh]:h-dvh">
          {/* Crossfade stack — both layers share one grid cell, so the incoming
          photo fades up while the outgoing holds its place. No translate, no
          scale, and the ink-900 base behind them prevents any black flash. */}
          <div className="absolute inset-0 grid">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={active.year}
                className="[grid-area:1/1]"
                initial={instant ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: instant ? 1 : 0 }}
                transition={{
                  duration: instant ? 0 : IMAGE_FADE_S,
                  ease: FADE_EASE,
                }}
              >
                <Image
                  src={active.image}
                  alt=""
                  fill
                  priority={activeIndex === 0}
                  sizes="100vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="absolute inset-0 bg-ink-900/55" />

          {/* Warm the neighbouring photos so a fade never reveals a half-loaded
          image. Rendered at 1px rather than hidden — display:none would stop
          the browser fetching them at all. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0"
          >
            {[activeIndex - 1, activeIndex + 1]
              .filter((i) => i >= 0 && i < historySlides.length)
              .map((i) => (
                <Image
                  key={historySlides[i].year}
                  src={historySlides[i].image}
                  alt=""
                  width={1}
                  height={1}
                />
              ))}
          </div>

          {/* Equal spacers above and below the timeline centre it in the space
          between the overlaid header and the copy block, which stays anchored
          to the bottom. min-h-0 + overflow-y-auto lets a landscape phone
          scroll this panel internally instead of overflowing the screen. */}
          <div
            className={cn(
              "container-page relative z-10 flex h-full min-h-0 flex-col overflow-y-auto",
              "pt-[calc(var(--header-height)+1.5rem)]",
              "pb-[calc(2rem+env(safe-area-inset-bottom))] lg:pb-[calc(3rem+env(safe-area-inset-bottom))]",
            )}
          >
            {/* Top spacer lands the year baselines at ~45% of the hero and, with
            no gap below the strip, the copy block's first baseline at ~56% —
            the two anchors from the reference frame. Below md the copy and the
            timeline share a row that sets its own top, so it is not needed. */}
            <div
              className="h-[29svh] shrink-0 max-md:hidden"
              aria-hidden="true"
            />

            {/* Below md the copy block and the timeline column are one flex row,
            both starting at the row's top — that shared top, not a tuned
            offset, is what lines the title up with the first year, so it holds
            through any type-scale change. `md:contents` dissolves the wrapper
            above md, leaving both children direct items of the column exactly
            as before. The row stops at 84vw (right-[16%]) so the rail's right
            edge — rule and dot centres — lands there, and starts at the page
            gutter so the copy keeps the container's left edge. */}
            <div className="md:contents max-md:absolute max-md:top-[13%] max-md:right-[16%] max-md:bottom-[6%] max-md:left-5 max-md:flex max-md:flex-row-reverse max-md:items-start max-md:gap-5">
              <div
                ref={stripRef}
                role="tablist"
                aria-label={t("about.history.timelineLabel")}
                aria-orientation={isMobile ? "vertical" : undefined}
                onKeyDown={onKeyDown}
                // No width, max-width or mx-auto of its own: the timeline rides the
                // page container, so the rule's ends land on the title's left edge
                // and the paragraph's right edge — one rectangle with the copy.
                //
                // Below md it is the row's right-hand column, stretched to the full
                // 13%→94% the row spans.
                className={cn(
                  "scrollbar-none relative w-full shrink-0 snap-x snap-mandatory overflow-x-auto",
                  "max-md:w-auto max-md:snap-none max-md:self-stretch max-md:overflow-visible",
                )}
              >
                <div
                  ref={rowRef}
                  // The years are inset 5% from each end so the rule visibly
                  // overshoots the outer dots — deliberate, per the reference.
                  // items-baseline keeps every year on one baseline.
                  // w-max + min-w-full: at least the container's width (so
                  // justify-between spreads the years), but grown to the content when
                  // the strip scrolls on a phone — otherwise the rule, which is
                  // inset-x-0 on this row, would stop at the visible edge.
                  // Below md the same row becomes a right-aligned column filling the
                  // rail's height, so justify-between distributes the years down it.
                  className={cn(
                    "relative flex w-max min-w-full items-baseline justify-between px-[5%]",
                    "max-md:h-full max-md:w-auto max-md:min-w-0 max-md:flex-col max-md:items-end max-md:px-0",
                  )}
                  style={
                    {
                      "--year-baseline": `${metrics.baseline}px`,
                    } as React.CSSProperties
                  }
                >
                  {/* Mobile rule: 1px wide, spanning the rail's full 13%→94%, so it
                overshoots the outer dots (which sit half a hit-area in from
                each end) exactly the way the desktop rule overshoots sideways.
                translate-x-1/2 puts its centre line on the rail's right edge,
                where the dots below are centred too. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 w-px translate-x-1/2 bg-[rgba(255,255,255,0.28)] md:hidden"
                  />

                  {/* Rule + dots ride in one measured overlay: the years above have
                different type sizes, so neither the shared baseline nor the
                per-year centres are expressible in CSS. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 max-md:hidden"
                    style={{ top: metrics.top }}
                  >
                    {/* inset-x-0 resolves against the row's *padding* box, so the
                  rule spans the full container while the years (inside the 5%
                  padding) sit inset from its ends. */}
                    <div className="absolute inset-x-0 h-px -translate-y-1/2 bg-[rgba(255,255,255,0.28)]" />
                    {metrics.centres.map((centre, index) => {
                      const isLarge = isEmphasised(index, activeIndex);
                      return (
                        <span
                          key={historySlides[index].year}
                          className={cn(
                            "absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white transition-all duration-700 ease-in-out motion-reduce:transition-none",
                            isLarge ? "h-2.25 w-2.25" : "h-1.25 w-1.25",
                          )}
                          style={{ left: centre }}
                        />
                      );
                    })}
                  </div>

                  {historySlides.map((slide, index) => {
                    const isActive = index === activeIndex;
                    const isLarge = isEmphasised(index, activeIndex);
                    return (
                      <button
                        key={slide.year}
                        ref={(el) => {
                          tabRefs.current[index] = el;
                        }}
                        type="button"
                        role="tab"
                        id={tabId(slide.year)}
                        aria-controls={PANEL_ID}
                        aria-selected={isActive}
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => {
                          if (!isActive) selectIndex(index);
                        }}
                        // pb-8 pushes the hit area down past the rule so the whole
                        // year+dot column is clickable and clears 44px.
                        //
                        // Below md the label is right-aligned with a 14px gutter out
                        // to the dot, and the 44px target grows leftward from it
                        // (min-w-11 + justify-end) rather than across the rule. The
                        // min() on the height keeps eleven 44px rows inside the rail
                        // down to a 598px-tall viewport and shrinks them, never the
                        // type, below that.
                        className={cn(
                          "relative flex min-h-11 min-w-11 shrink-0 snap-center justify-center rounded-sm pb-8",
                          "outline-offset-4 focus-visible:outline-2 focus-visible:outline-white",
                          "max-md:min-h-[min(2.75rem,7.36svh)] max-md:snap-align-none",
                          "max-md:items-center max-md:justify-end max-md:pr-3.5 max-md:pb-0",
                          "group",
                          isActive ? "cursor-default" : "cursor-pointer",
                        )}
                      >
                        <span
                          data-year
                          className={cn(
                            "font-light whitespace-nowrap text-white",
                            // Emphasis is a scale(), never a font-size change: every
                            // slot is laid out at the LARGE size, so the row keeps
                            // its width, its spacing and its dot positions no matter
                            // which year is selected. Scale + opacity ride the same
                            // 700ms curve as the photo crossfade.
                            "transition-[scale,opacity] duration-700 ease-in-out motion-reduce:transition-none",
                            "text-[clamp(1.5rem,0.52rem+1.923vw,2.25rem)] max-md:text-[1.375rem] max-md:tracking-[-0.03em]",
                            // The origin is what keeps a shrunken label anchored:
                            // at >= md on the measured baseline, so the row's shared
                            // baseline never moves; below md on the right edge and
                            // optical centre, so the 14px gutter out to the dot and
                            // the dot's own row both hold.
                            "origin-[50%_var(--year-baseline)] max-md:origin-right",
                            // 18/36 at >= md, 14/22 below it.
                            isLarge
                              ? "scale-100 opacity-100"
                              : "scale-50 opacity-55 group-hover:opacity-85 max-md:scale-[0.6364]",
                          )}
                        >
                          {slide.year}
                        </span>

                        {/* Mobile dot. right-0 lands its right edge on the rail edge
                      and translate-x-1/2 shifts it back by half its width, so
                      the centre sits on the rule whichever size it is. */}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute top-1/2 right-0 rounded-full bg-white md:hidden",
                            "-translate-y-1/2 translate-x-1/2 transition-all duration-700 ease-in-out motion-reduce:transition-none",
                            isLarge ? "size-[9px]" : "size-[5px]",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title anchors to the page container's left edge; the paragraph's
            right edge lands on the timeline strip's right edge, which is what
            the shared TIMELINE_WIDTH expression buys. items-baseline puts the
            paragraph's first line on the title's first baseline. */}
              <div
                role="tabpanel"
                id={PANEL_ID}
                aria-labelledby={tabId(active.year)}
                tabIndex={-1}
                // Split at 1024, not the project's lg (1200) — that's where the
                // reference moves the copy into two columns.
                // Split at 1024, not the project's lg (1200). The 1024+ padding sets
                // the ~70px from the rule down to the title's cap-height at 1440.
                // Below md it is the row's left column: no leading offset of its own
                // (the shared row top is the alignment), and it takes the width the
                // rail leaves, so the paragraph can never run under the years.
                className="mt-10 flex shrink-0 flex-col gap-6 pt-8 max-md:mt-0 max-md:min-w-0 max-md:flex-1 max-md:pt-0 min-[1024px]:mt-0 min-[1024px]:flex-row min-[1024px]:items-start min-[1024px]:justify-between min-[1024px]:gap-12 min-[1024px]:pt-[clamp(2.25rem,3.13vw,2.8125rem)]"
              >
                {/* 90px / 0.95 / -0.03em at the 1440 reference width. The 0.95
              leading is tighter than the glyph box, so nothing in the chain
              above may clip — the copy block carries no overflow rule. */}
                <h1 className="font-light tracking-[-0.03em] text-white text-[clamp(40px,6.25vw,90px)] leading-[0.95]">
                  {t("about.history.title")}
                </h1>

                {/* Grid stack: during the crossfade both paragraphs are in the DOM,
              and sharing one cell keeps them from reflowing the row. */}
                {/* Right edge is the container's right edge (justify-between on the
              row), which is exactly where the rule above ends. */}
                <div className="grid w-full shrink-0 min-[1024px]:w-[41%]">
                  <AnimatePresence mode="sync" initial={false}>
                    <motion.p
                      key={active.year}
                      className="[grid-area:1/1] font-normal tracking-[-0.03em] text-white/90 text-[clamp(16px,1.39vw,20px)] leading-[1.25]"
                      initial={instant ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: instant ? 1 : 0 }}
                      transition={{
                        duration: instant ? 0 : TEXT_FADE_S,
                        ease: FADE_EASE,
                      }}
                    >
                      {t(active.paragraphKey)}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="flex-1" aria-hidden="true" />
          </div>
        </section>
      </div>
    </div>
  );
}
