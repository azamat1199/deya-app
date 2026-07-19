"use client";

import { useState } from "react";

import PartnerForm from "@/components/forms/PartnerForm";
import { Button, Modal } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";

export interface ContactSalesButtonProps {
  className?: string;
}

export default function ContactSalesButton({ className }: ContactSalesButtonProps) {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="primary" size="lg" className={className} onClick={() => setIsOpen(true)}>
        {t("buttons.contactSales")}
      </Button>

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={t("buttons.contactSales")}>
        <PartnerForm onSuccess={() => setIsOpen(false)} />
      </Modal>
    </>
  );
}
