"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import { useTranslation } from "@/lib/i18n/useTranslation";
import { cn } from "@/lib/cn";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { usePresence } from "@/lib/usePresence";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
}: ModalProps) {
  const { t } = useTranslation();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // One-time client-mount flag: `document` doesn't exist during SSR, so the
    // portal target can't be resolved until after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  // `&& mounted`: until the portal exists there is no panel to trap focus in.
  // A modal that is already open on its first render (ui/LazyModal mounts it
  // at the moment of opening) would otherwise run the trap against a null ref
  // once and never again — no initial focus, no Escape, no scroll lock.
  useFocusTrap(isOpen && mounted, panelRef, onClose);
  // Stays mounted for the 300ms backdrop fade-out after closing.
  const { rendered, closing } = usePresence(isOpen, 300);

  if (!mounted || !rendered) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        closing && "pointer-events-none",
      )}
    >
      <div
        className={cn(
          "absolute inset-0 bg-ink-900/60 backdrop-blur-sm",
          closing ? "anim-fade-out" : "anim-fade-in",
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "relative max-h-[90vh] w-full max-w-[715px] overflow-y-auto rounded-lg bg-white p-6 md:p-8",
          closing ? "anim-pop-out" : "anim-pop-in",
        )}
      >
        <button
          type="button"
          aria-label={t("a11y.closeModal")}
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-ink-500 hover:bg-light hover:text-[#DA1F26] hover:cursor-pointer"
        >
          <X size={22} />
        </button>

        {title && (
          <h2 className="pr-8 text-xl font-semibold text-ink-900">{title}</h2>
        )}

        <div className={title ? "mt-4" : undefined}>{children}</div>
      </div>
    </div>,
    document.body,
  );
}
