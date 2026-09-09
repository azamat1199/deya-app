"use client";

import { useEffect, useState } from "react";

import PartnerForm from "@/components/forms/PartnerForm";
import { Button, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";

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
