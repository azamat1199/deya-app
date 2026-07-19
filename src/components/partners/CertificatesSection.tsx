"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button, Slider } from "@/components/ui";
import { certificates, certificatesContent } from "@/content/certificates";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function CertificatesSection() {
  const { t } = useTranslation();

  return (
    <div className="py-16 lg:py-24">
      <h2 className="text-center text-2xl font-normal text-ink-900 md:text-3xl">
        {certificatesContent.heading}
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-center text-ink-500">
        {certificatesContent.description}
      </p>

      <div className="relative mt-10">
        <Slider
          items={certificates}
          slidesPerView={1}
          gap={24}
          align="center"
          breakpoints={{
            768: { slidesPerView: 2, gap: 24 },
            1024: { slidesPerView: 3, gap: 32 },
          }}
          renderSlide={(cert) => (
            <div className="rounded-lg border border-line-100 bg-white p-6 shadow-sm">
              <div className="relative aspect-3/4 w-full overflow-hidden rounded-md bg-white">
                <Image
                  src={cert.image}
                  alt={cert.title}
                  fill
                  className="object-contain p-3"
                />
              </div>
            </div>
          )}
          renderControls={({
            scrollPrev,
            scrollNext,
            canScrollPrev,
            canScrollNext,
          }) => (
            <>
              {canScrollPrev && (
                <button
                  type="button"
                  aria-label="Предыдущий слайд"
                  onClick={scrollPrev}
                  className="absolute top-1/2 left-0 z-10 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
                >
                  <ChevronLeft size={20} />
                </button>
              )}
              {canScrollNext && (
                <button
                  type="button"
                  aria-label="Следующий слайд"
                  onClick={scrollNext}
                  className="absolute top-1/2 right-0 z-10 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-brand-600 text-white transition-colors hover:bg-brand-700"
                >
                  <ChevronRight size={20} />
                </button>
              )}
            </>
          )}
        />
      </div>

      <div className="mt-10 flex justify-center">
        <Button variant="primary" size="lg" href="#">
          {t("buttons.downloadCatalog")}
        </Button>
      </div>
    </div>
  );
}
