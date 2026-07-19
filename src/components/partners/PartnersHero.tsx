"use client";

import { useState } from "react";
import Image from "next/image";

import PartnerForm from "@/components/forms/PartnerForm";
import { Button, Modal } from "@/components/ui";
import { partnersContent } from "@/content/partners";
import { useTranslation } from "@/lib/i18n/useTranslation";

export default function PartnersHero() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative h-175 w-full overflow-hidden bg-ink-900 md:h-150 lg:h-175 xl:h-197.5">
      <Image
        src={partnersContent.image}
        alt={partnersContent.heading}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-ink-900/50" />

      <div className="container-page relative z-10 flex h-full flex-col justify-end pb-16 lg:pb-20">
        <h1 className="max-w-xl text-5xl font-light text-white lg:text-7xl">
          {partnersContent.heading}
        </h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 lg:text-base">
          {partnersContent.description}
        </p>
        <Button
          variant="white"
          size="lg"
          className="mt-8 w-fit"
          onClick={() => setIsOpen(true)}
        >
          {t("buttons.partnerForm")}
        </Button>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={partnersContent.heading}
      >
        <PartnerForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </div>
  );
}
