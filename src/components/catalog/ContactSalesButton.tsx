"use client";

import { useEffect, useState } from "react";

import PartnerForm from "@/components/forms/PartnerForm";
import { Button, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";

export interface ContactSalesButtonProps {
  className?: string;
  /**
   * Id of the product whose page this button sits on. Optional: without it the
   * lead is still sent as "sales", just with no `product` field in the body.
   */
  productId?: number;
}

export default function ContactSalesButton({
  className,
  productId,
}: ContactSalesButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  // This button only ever appears on a product page, so a missing id is a wiring
  // bug rather than a valid state. The lead still sends — just without the
  // `product` key — but it never does so silently.
  useEffect(() => {
    if (productId === undefined) {
      console.error(
        "[ContactSalesButton] rendered with no productId. This button only appears on a product page, so the sales lead will be submitted without a `product` field — check that the page passes detail.id.",
      );
    }
  }, [productId]);

  return (
    <>
      <Button variant="primary" size="lg" className={className} onClick={() => setIsOpen(true)}>
        {t("buttons.contactSales")}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t("buttons.contactSales")}>
        {/* Same shared form, submitted as a sales lead rather than a partner
            one, carrying this page's product id when it has one. */}
        <PartnerForm type="sales" productId={productId} />
      </Modal>
    </>
  );
}
