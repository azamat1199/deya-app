"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui";
import { useTranslation } from "@/lib/i18n/useTranslation";

import type { CertificateCard } from "./CertificatesGrid";

export interface CertificatesDownloadButtonProps {
  items: CertificateCard[];
}

/**
 * Gap between downloads. Browsers treat a burst of programmatic clicks as a
 * single suspicious event; spacing them keeps each one attributable to the
 * user's gesture. 400ms is the middle of the 300-500ms the brief asks for.
 */
const STAGGER_MS = 400;

/**
 * How long a blob URL is kept alive after its click. Revoking immediately can
 * cancel a download that has not started reading yet; revoking never would leak
 * the whole image for the life of the page.
 */
const REVOKE_AFTER_MS = 60_000;

/**
 * The certificate images live on the CMS host (deya.uz/media/...), which is a
 * DIFFERENT ORIGIN from the app and sends neither CORS headers nor
 * Content-Disposition. Measured consequences, verified in Chromium:
 *
 *   · an <a download> pointing straight at the media URL is IGNORED — the
 *     browser navigates to the image instead of saving it, and that navigation
 *     tears down the page, so any files queued behind it never fire at all;
 *   · fetch() against it is blocked outright: "No 'Access-Control-Allow-Origin'
 *     header is present on the requested resource".
 *
 * Both are avoided by going through Next's own image optimizer, which is
 * SAME-ORIGIN: /_next/image proxies the remote file, so fetch() is allowed and
 * the blob it produces is ours to name. The image also already renders through
 * this exact route (next/image in CertificatesGrid), so the bytes are usually
 * warm in the cache and this downloads what is actually on screen.
 *
 * w=640 is above the source width of the real certificates (279px), and the
 * optimizer never upscales — measured: w=384 and above both return the original
 * 279x366. So this is a re-compression, not a downscale.
 */
function optimizedSrc(src: string): string {
  return `/_next/image?url=${encodeURIComponent(src)}&w=640&q=75`;
}

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "image/svg+xml": "svg",
};

/**
 * The extension comes from what the server actually returned, not from the
 * source URL: the optimizer answers whatever format content negotiation picks,
 * so a .png source can come back as WebP on a browser that asked for it, and
 * naming those bytes ".png" would produce a file the OS opens wrongly.
 * The URL is only the fallback.
 */
function extensionFor(blobType: string, src: string): string {
  const fromMime = EXTENSION_BY_MIME[blobType.split(";")[0]!.trim().toLowerCase()];
  if (fromMime) return fromMime;
  const fromUrl = src.split("?")[0]!.split(".").pop();
  return fromUrl && /^[a-z0-9]{2,5}$/i.test(fromUrl) ? fromUrl.toLowerCase() : "img";
}

/**
 * The certificate's own title as the filename, so the user gets
 * "ISO 22000-2018.png" rather than the CMS's "Image_3.png".
 *
 * Sanitised because real titles contain characters filesystems reject — the
 * live data has "ISO 22000:2018", and a colon is illegal on Windows and
 * confuses macOS. Control characters are stripped for the same reason, and a
 * leading dot is removed so the file cannot land hidden on Unix.
 */
function fileNameFor(title: string, extension: string): string {
  const safe = title
    .trim()
    // Spaces are deliberately NOT in this class: they are legal in
    // filenames, and "ISO 22000-2018.png" reads better than the
    // hyphenated alternative.
    .replace(/[<>:"/\\|?*\u0000-\u001F]/g, "-")
    .replace(/\s+/g, " ")
    .replace(/^\.+/, "")
    .slice(0, 80)
    .trim();
  return `${safe || "certificate"}.${extension}`;
}

function interpolate(template: string, current: number, total: number): string {
  return template
    .replace("{current}", String(current))
    .replace("{total}", String(total));
}

type Progress =
  | { phase: "idle" }
  | { phase: "running"; current: number; total: number }
  | { phase: "done"; saved: number; total: number };

/**
 * Downloads every certificate image as its own file, one after another.
 *
 * No ZIP and no bundling, per the brief — and no zip library either, which is
 * also why the files go out individually rather than combined.
 */
export default function CertificatesDownloadButton({
  items,
}: CertificatesDownloadButtonProps) {
  const { t } = useTranslation();
  const [progress, setProgress] = useState<Progress>({ phase: "idle" });

  // Guards the async loop against a second click and against setting state
  // after the section unmounts mid-download.
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // A certificate with no image is skipped rather than queued as a dead
  // download — filtered here so the count shown to the user is the count that
  // will actually be attempted.
  const downloadable = useMemo(
    () => items.filter((item) => item.image.trim() !== ""),
    [items],
  );
  const total = downloadable.length;

  const handleDownload = useCallback(async () => {
    if (runningRef.current || total === 0) return;
    runningRef.current = true;
    let saved = 0;

    for (let index = 0; index < downloadable.length; index += 1) {
      const certificate = downloadable[index]!;
      if (!mountedRef.current) break;
      setProgress({ phase: "running", current: index + 1, total });

      try {
        const response = await fetch(optimizedSrc(certificate.image));
        // NOT assumed to have succeeded: a non-2xx is counted as a miss and the
        // loop carries on, so one broken image cannot end the whole run.
        if (response.ok) {
          const blob = await response.blob();
          const href = URL.createObjectURL(blob);
          const anchor = document.createElement("a");
          anchor.href = href;
          anchor.download = fileNameFor(
            certificate.title,
            extensionFor(blob.type, certificate.image),
          );
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          window.setTimeout(() => URL.revokeObjectURL(href), REVOKE_AFTER_MS);
          saved += 1;
        }
      } catch {
        // Network failure or a blocked request: counted, never thrown, so the
        // summary below can tell the user what actually arrived.
      }

      if (index < downloadable.length - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, STAGGER_MS));
      }
    }

    runningRef.current = false;
    if (mountedRef.current) setProgress({ phase: "done", saved, total });
  }, [downloadable, total]);

  const label =
    progress.phase === "running"
      ? interpolate(
          t("buttons.downloadingProgress"),
          progress.current,
          progress.total,
        )
      : t("buttons.downloadCertificates");

  return (
    <div className="mt-10 flex flex-col items-center gap-2">
      {/* Passed through Button's own className prop, which cn() merges last
          onto the root — no edit to the shared component. font-sans IS the
          Roboto utility here: globals.css maps --font-sans to --font-roboto
          and deliberately exposes no bare font-roboto class. Classes are
          carried over verbatim from the catalogue button this replaces, so the
          section's layout and type are unchanged. */}
      <Button
        variant="primary"
        size="lg"
        // Nothing to fetch => nothing to offer. Covers both an empty section and
        // a CMS row whose image field is blank.
        disabled={total === 0 || progress.phase === "running"}
        onClick={handleDownload}
        className="max-md:w-full max-md:font-sans max-md:font-medium max-md:text-[12px] max-md:leading-[1.2] max-md:tracking-normal max-md:text-center max-md:uppercase"
      >
        {label}
      </Button>

      {/* Partial results are stated rather than left silent: if the browser
          blocked some of the files, "Скачано 2 из 3" is the only way the user
          finds out. Announced politely so a screen reader hears the outcome
          without the running count interrupting. */}
      {progress.phase === "done" && progress.saved < progress.total && (
        <p role="status" aria-live="polite" className="text-sm text-ink-500">
          {interpolate(
            t("buttons.downloadPartial"),
            progress.saved,
            progress.total,
          )}
        </p>
      )}
    </div>
  );
}
