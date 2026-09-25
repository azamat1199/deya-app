"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useTranslation } from "@/lib/i18n/useTranslation";

// Loaded on demand: this form lives inside a Modal that only mounts when the
// user opens it, and it is the entry point to libphonenumber-js's metadata and
// react-hook-form. Importing it statically put both on the critical path of a
// page where no phone field is ever shown. Measured, not assumed — see the
// optimization report.
const PartnerForm = dynamic(() => import("@/components/forms/PartnerForm"), {
  ssr: false,
});

export interface ContactSalesButtonProps {
  className?: string;
  productId?: number;
}

export default function ContactSalesButton({
  className,
  productId,
}: ContactSalesButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    if (productId === undefined) {
      console.error(
        "[ContactSalesButton] rendered with no productId. This button only appears on a product page, so the sales lead will be submitted without a `product` field — check that the page passes detail.id.",
      );
    }
  }, [productId]);

  return (
    <>
      <Button
        variant="primary"
        size="lg"
        className={className}
        onClick={() => setIsOpen(true)}
      >
        {t("buttons.contactSales")}
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t("buttons.contactSales")}
      >
        <PartnerForm type="sales" productId={productId} />
      </Modal>
    </>
  );
}
