"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, useReducedMotion } from "framer-motion";

import PartnerForm from "@/components/forms/PartnerForm";
import { Button, Modal, ScrollReveal } from "@/components/ui";
import { exportRegions } from "@/content/regions";
import { homeContent } from "@/content/home";
import { cn } from "@/lib/cn";
import { useTranslation } from "@/lib/i18n/useTranslation";

const CENTER = { x: 1005, y: 305 };
const CENTER_LABEL = { x: 1020, y: 309 };
const DIAGRAM_WIDTH = 1400;
const DIAGRAM_HEIGHT = 480;

const LINE_TRANSITION = { duration: 1.1, ease: "easeInOut" as const };
const CENTER_TRANSITION = { duration: 0.4 };
const DOT_TRANSITION = { duration: 0.4, delay: 0.9 };
const LABEL_TRANSITION = { duration: 0.5, delay: 1.0 };
const INSTANT_TRANSITION = { duration: 0 };

export default function ExportMap() {
  const { t } = useTranslation();
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);
  const diagramRef = useRef<SVGSVGElement>(null);
  const inView = useInView(diagramRef, { once: true, margin: "-100px" });
  const prefersReducedMotion = useReducedMotion();

  // With reduced motion, skip straight to the final state instead of animating.
  const shouldAnimate = prefersReducedMotion || inView;
  const lineTransition = prefersReducedMotion ? INSTANT_TRANSITION : LINE_TRANSITION;
  const centerTransition = prefersReducedMotion ? INSTANT_TRANSITION : CENTER_TRANSITION;
  const dotTransition = prefersReducedMotion ? INSTANT_TRANSITION : DOT_TRANSITION;
  const labelTransition = prefersReducedMotion ? INSTANT_TRANSITION : LABEL_TRANSITION;

  return (
    <div>
      <div className="relative">
        <div
          className="absolute inset-y-0 left-1/2 right-1/2 w-screen mx-[-50vw]"
          style={{
            background:
              "linear-gradient(180deg, #FFFCF7 30.77%, rgba(255, 252, 247, 0.00) 77.4%)",
          }}
          aria-hidden="true"
        />

        <ScrollReveal direction="up">
          <div className="relative grid items-center gap-10 pt-16 lg:grid-cols-[40%_60%] lg:gap-0 lg:pt-24">
            <h2 className="max-w-120 text-3xl leading-tight font-light whitespace-pre-line text-ink-900 lg:text-4xl xl:text-5xl">
              {homeContent.exportMap.heading}
            </h2>

            <div className="relative mx-auto aspect-square w-full max-w-225 md:aspect-35/12">
              <svg
                ref={diagramRef}
                viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {exportRegions.map((region) => (
                  <motion.line
                    key={region.name}
                    x1={CENTER.x}
                    y1={CENTER.y}
                    x2={region.x}
                    y2={region.y}
                    stroke="var(--color-ink-900)"
                    strokeWidth={1}
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={shouldAnimate ? { pathLength: 1, opacity: 1 } : undefined}
                    transition={lineTransition}
                  />
                ))}
              </svg>

              {/* Dots are plain HTML circles (not SVG) so they stay round even
                  though the SVG above is stretched non-uniformly on mobile. */}
              <motion.span
                className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600"
                style={{
                  left: `${(CENTER.x / DIAGRAM_WIDTH) * 100}%`,
                  top: `${(CENTER.y / DIAGRAM_HEIGHT) * 100}%`,
                }}
                initial={{ scale: 0, opacity: 0 }}
                animate={shouldAnimate ? { scale: 1, opacity: 1 } : undefined}
                transition={centerTransition}
              />
              {exportRegions.map((region) => (
                <motion.span
                  key={region.name}
                  className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600"
                  style={{
                    left: `${(region.x / DIAGRAM_WIDTH) * 100}%`,
                    top: `${(region.y / DIAGRAM_HEIGHT) * 100}%`,
                  }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={shouldAnimate ? { scale: 1, opacity: 1 } : undefined}
                  transition={dotTransition}
                />
              ))}

              <motion.span
                className="absolute -translate-y-1/2 translate-x-2 text-[11px] font-medium tracking-wide text-brand-600 uppercase"
                style={{
                  left: `${(CENTER_LABEL.x / DIAGRAM_WIDTH) * 100}%`,
                  top: `${(CENTER_LABEL.y / DIAGRAM_HEIGHT) * 100}%`,
                }}
                initial={{ opacity: 0 }}
                animate={shouldAnimate ? { opacity: 1 } : undefined}
                transition={centerTransition}
              >
                Фабрика Deya
              </motion.span>

              {exportRegions.map((region) => (
                <motion.span
                  key={region.name}
                  className={cn(
                    "absolute -translate-y-1/2 text-[9px] leading-tight font-medium text-ink-900 uppercase",
                    "max-w-20 whitespace-normal md:max-w-none md:text-[11px] md:whitespace-nowrap",
                    region.anchor === "end"
                      ? "-translate-x-[calc(100%+0.5rem)] text-right md:text-left"
                      : "translate-x-2",
                  )}
                  style={{
                    left: `${(region.x / DIAGRAM_WIDTH) * 100}%`,
                    top: `${(region.y / DIAGRAM_HEIGHT) * 100}%`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={shouldAnimate ? { opacity: 1 } : undefined}
                  transition={labelTransition}
                >
                  {region.name}
                </motion.span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal direction="fade">
        <div className="relative left-1/2 right-1/2 mt-12 w-screen mx-[-50vw] lg:mt-16">
          <div className="relative h-100 overflow-hidden md:h-125 lg:h-150 xl:h-175">
            <div
              className="absolute inset-x-0 top-0 z-10 h-24"
              style={{
                background: "linear-gradient(180deg, #FFFCF7 0%, rgba(255, 252, 247, 0.00) 100%)",
              }}
              aria-hidden="true"
            />

            <Image
              src={homeContent.exportMap.truckStripImage}
              alt="Логистика Deya"
              fill
              sizes="100vw"
              className="object-cover"
            />

            <Button
              variant="white"
              size="md"
              className="absolute bottom-4 left-4 shadow-md lg:bottom-12 lg:left-16 lg:px-10 lg:py-4"
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
        title="Как стать партнёром?"
      >
        <PartnerForm onSuccess={() => setIsPartnerFormOpen(false)} />
      </Modal>
    </div>
  );
}
