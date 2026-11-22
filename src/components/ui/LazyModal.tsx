"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

import type { ModalProps } from "./Modal";

// framer-motion lives in Modal's chunk. Loading it here, on demand, keeps it
// out of the initial JS of every page that merely CONTAINS a closed modal
// (product pages, the home export map, the partners hero).
const Modal = dynamic(() => import("./Modal"), { ssr: false });

/**
 * Drop-in for ui/Modal with the same props. Renders nothing — and downloads
 * nothing — until the first time `isOpen` is true; from then on the real Modal
 * stays mounted so its close animation still plays. The first open waits for
 * one small chunk, which is fetched while the click is being handled.
 */
export default function LazyModal(props: ModalProps) {
  const [hasOpened, setHasOpened] = useState(props.isOpen);
  // Latch during render (React's "storing information from previous renders"
  // pattern) rather than in an effect, so the open render already mounts it.
  if (props.isOpen && !hasOpened) setHasOpened(true);

  return hasOpened ? <Modal {...props} /> : null;
}
