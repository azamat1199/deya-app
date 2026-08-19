"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { Slider } from "@/components/ui";
import { careersContent } from "@/content/careers";
import { mediaUrl, normaliseOrigin } from "@/lib/api";

/**
 * GET /api/v1/career-values/ answers with a BARE ARRAY, not the
 * { count, next, results } envelope DRF list views usually return — so the
 * body is used directly and nothing unwraps .results.
 */
interface CareerValue {
  id: number;
  title: string;
  text: string;
  image: string;
}

/** The shape both sources normalise to, so the JSX below reads one thing. */
interface AboutTile {
  id: string | number;
  title: string;
  description: string;
  image: string | null;
}

// Trailing slash is load-bearing: Django's APPEND_SLASH answers the slashless
// form with a 301, confirmed against the live host. Do not trim it.
const CAREER_VALUES_PATH = "/api/v1/career-values/";

/**
 * The hand-authored tiles, kept as the fallback rather than deleted. This is
 * also the initial state, so the server render and first paint show real copy
 * and the section can never appear blank while the request is in flight.
 */
const STATIC_TILES: AboutTile[] = careersContent.about.tiles.map((tile) => ({
  id: tile.title,
  title: tile.title,
  description: tile.description,
  image: tile.image,
}));

function isCareerValue(value: unknown): value is CareerValue {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.title === "string" &&
    candidate.title.trim() !== "" &&
    typeof candidate.text === "string" &&
    typeof candidate.image === "string"
  );
}

function TileBackground({ image }: { image: string | null }) {
  if (!image) {
    return (
      <div className="absolute inset-0 bg-linear-to-br from-brand-500 to-brand-700" />
    );
  }

  return (
    <>
      <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-ink-900/55" />
    </>
  );
}

export default function CareersAbout() {
  // Starts on the static content, so a failure, a timeout, an empty array or
  // malformed items all resolve by simply never replacing it.
  const [tiles, setTiles] = useState<AboutTile[]>([]);

  useEffect(() => {
    // Host comes from the environment, never from this file. With the variable
    // unset there is nothing to call, so the static fallback stands.
    const base = process.env.NEXT_PUBLIC_API_URL;
    if (!base) return;
    const origin = normaliseOrigin(base);

    const controller = new AbortController();

    fetch(`${origin}${CAREER_VALUES_PATH}`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    })
      .then((response) =>
        response.ok
          ? (response.json() as Promise<unknown>)
          : Promise.reject(new Error(String(response.status))),
      )
      .then((body) => {
        if (!Array.isArray(body)) return;

        const values = body.filter(isCareerValue);
        // An empty or wholly malformed payload is treated as no answer at all:
        // stale copy beats an empty grid on a public marketing page.
        if (values.length === 0) return;

        setTiles(
          values.map((value, index) => ({
            id: value.id,
            title: value.title,
            description: value.text,
            // The payload's absolute URLs arrive over http://; mediaUrl
            // upgrades them to https:// so next/image accepts them and the
            // browser does not block them as mixed content. An empty image
            // borrows the static artwork at the same position, and past the
            // static count TileBackground falls through to its brand gradient.
            image: mediaUrl(value.image, origin) || STATIC_TILES[index]?.image || null,
          })),
        );
      })
      // Network error, non-2xx, invalid JSON — all keep the fallback, but none
      // of them stay silent any more. `cause` is a separate argument because
      // Node/undici reports network-level failures as the bare string "fetch
      // failed" and hides the real reason (ENOTFOUND, ECONNREFUSED, a TLS
      // error) in error.cause.
      .catch((error: unknown) => {
        // An abort is this effect cleaning up on unmount, not a failure.
        if (error instanceof DOMException && error.name === "AbortError") return;
        console.error(
          "[CareersAbout] falling back to static content —",
          error instanceof Error ? error.message : String(error),
          "| cause:",
          error instanceof Error ? (error.cause ?? "(none)") : "(none)",
        );
      });

    return () => controller.abort();
  }, []);

  return (
    <>
      {/* Phone: single-card swipeable carousel with dot pagination. */}
      <div className="container-page py-10 md:hidden">
        <Slider
          items={tiles}
          slidesPerView={1}
          showPagination
          renderSlide={(tile) => (
            <div className="relative flex aspect-[32/47] w-full items-stretch overflow-hidden ">
              <TileBackground image={tile.image} />
              <div className="relative z-10 flex h-full w-full flex-col justify-between gap-3 px-5 pt-8 pb-6">
                <h3 className="w-full text-center text-xl font-normal text-white max-md:text-center max-md:text-[24px] max-md:leading-[1.1] max-md:font-light max-md:tracking-[-0.03em]">
                  {tile.title}
                </h3>
                <p className="text-xs leading-relaxed text-white/80 max-md:text-center max-md:text-[13px] max-md:leading-[1.35] max-md:font-normal max-md:tracking-normal">
                  {tile.description}
                </p>
              </div>
            </div>
          )}
        />
      </div>

      {/* Tablet/desktop: full-bleed 2x2 grid. */}
      <div className="relative left-1/2 right-1/2 hidden w-screen mx-[-50vw] md:block">
        <div className="grid grid-cols-2 gap-0.5">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className="relative flex aspect-2/1 items-end overflow-hidden bg-brand-600 lg:aspect-auto lg:h-[370px] lg:items-stretch xl:h-[clamp(370px,23.125vw,520px)]"
            >
              <TileBackground image={tile.image} />

              <div className="relative z-10 flex w-full flex-col items-center gap-4 px-6 pb-8 text-center lg:h-full lg:justify-between lg:pt-8">
                <h3 className="text-xl font-normal text-white lg:text-2xl pt-7 max-md:pt-5">
                  {tile.title}
                </h3>
                <p className="max-w-sm text-xs leading-relaxed text-white/80 lg:text-sm">
                  {tile.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
