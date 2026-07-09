"use client";

import { useState } from "react";
import Image from "next/image";

import PartnerForm from "@/components/forms/PartnerForm";
import { Button, Modal, ScrollReveal } from "@/components/ui";
import { exportRegions } from "@/content/regions";
import { homeContent } from "@/content/home";
import { useTranslation } from "@/lib/i18n/useTranslation";

const CENTER = { x: 643, y: 299.5 };
const DIAGRAM_WIDTH = 900;
const DIAGRAM_HEIGHT = 450;

export default function ExportMap() {
  const { t } = useTranslation();
  const [isPartnerFormOpen, setIsPartnerFormOpen] = useState(false);

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

            <div className="relative mx-auto hidden aspect-900/450 w-full max-w-225 md:block">
              <svg
                viewBox={`0 0 ${DIAGRAM_WIDTH} ${DIAGRAM_HEIGHT}`}
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
              >
                {exportRegions.map((region) => (
                  <line
                    key={region.name}
                    x1={CENTER.x}
                    y1={CENTER.y}
                    x2={region.x}
                    y2={region.y}
                    stroke="var(--color-ink-900)"
                    strokeWidth={1}
                  />
                ))}
                <circle cx={CENTER.x} cy={CENTER.y} r={5} fill="var(--color-brand-600)" />
                {exportRegions.map((region) => (
                  <circle
                    key={region.name}
                    cx={region.x}
                    cy={region.y}
                    r={4}
                    fill="var(--color-brand-600)"
                  />
                ))}
              </svg>

              <span
                className="absolute -translate-x-1/2 -translate-y-full text-[11px] font-medium tracking-wide text-brand-600 uppercase"
                style={{
                  left: `${(CENTER.x / DIAGRAM_WIDTH) * 100}%`,
                  top: `calc(${(CENTER.y / DIAGRAM_HEIGHT) * 100}% - 20px)`,
                }}
              >
                Фабрика Deya
              </span>

              {exportRegions.map((region) => (
                <span
                  key={region.name}
                  className="absolute -translate-y-1/2 text-[10px] font-medium whitespace-nowrap text-ink-900 uppercase"
                  style={{
                    left: `${(region.x / DIAGRAM_WIDTH) * 100 + 1.5}%`,
                    top: `${(region.y / DIAGRAM_HEIGHT) * 100}%`,
                  }}
                >
                  {region.name}
                </span>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      <ScrollReveal direction="fade">
        <div className="relative left-1/2 right-1/2 mt-12 w-screen mx-[-50vw] lg:mt-16">
          <div className="relative h-100 overflow-hidden md:h-125 lg:h-150 xl:h-175">
            <Image
              src={homeContent.exportMap.truckStripImage}
              alt="Логистика Deya"
              fill
              sizes="100vw"
              className="object-cover"
            />

            <Button
              variant="outline-white"
              size="md"
              className="absolute bottom-8 left-5 lg:bottom-12 lg:left-20 lg:px-10 lg:py-4"
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
