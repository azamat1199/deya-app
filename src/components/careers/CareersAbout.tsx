// Still a client component, and not by accident: the phone branch renders
// through <Slider>, whose `renderSlide` prop is a FUNCTION. Functions cannot
// cross the server/client boundary, so this file has to stay on the client even
// though it no longer fetches anything. The fetch itself had no business here —
// see lib/careerValues.ts.
"use client";

import Image from "next/image";

import { Slider } from "@/components/ui";
import { careersContent } from "@/content/careers";

/** The shape both sources normalise to, so the JSX below reads one thing. */
export interface AboutTile {
  id: string | number;
  title: string;
  description: string;
  image: string | null;
}

/**
 * The hand-authored tiles, kept as the fallback rather than deleted. Resolved
 * on the SERVER now (see the careers page), so the prop always arrives
 * populated and the section can never paint empty — which is exactly what it
 * did while this array was merely a fallback and the initial state was [].
 *
 * Each id is the tile's own title: stable, unique, and never undefined, so the
 * static path cannot produce a duplicate React key either.
 */
export const STATIC_TILES: AboutTile[] = careersContent.about.tiles.map(
  (tile) => ({
    id: tile.title,
    title: tile.title,
    description: tile.description,
    image: tile.image,
  }),
);

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

export interface CareersAboutProps {
  /** Resolved on the server by the careers page — API rows when the request
   *  succeeded, STATIC_TILES when it failed or came back empty. Always
   *  populated, so the section never paints an empty grid. */
  tiles: AboutTile[];
}

export default function CareersAbout({ tiles }: CareersAboutProps) {
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
