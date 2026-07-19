"use client";

import Image from "next/image";

import { Slider } from "@/components/ui";
import { careersContent } from "@/content/careers";

function TileBackground({ image }: { image: string | null }) {
  if (!image) {
    return <div className="absolute inset-0 bg-linear-to-br from-brand-500 to-brand-700" />;
  }

  return (
    <>
      <Image src={image} alt="" fill sizes="100vw" className="object-cover" />
      <div className="absolute inset-0 bg-ink-900/55" />
    </>
  );
}

export default function CareersAbout() {
  const { tiles } = careersContent.about;

  return (
    <>
      {/* Phone: single-card swipeable carousel with dot pagination. */}
      <div className="container-page py-10 md:hidden">
        <Slider
          items={[...tiles]}
          slidesPerView={1}
          showPagination
          renderSlide={(tile) => (
            <div className="relative flex aspect-2/1 items-end overflow-hidden rounded-lg">
              <TileBackground image={tile.image} />
              <div className="absolute inset-y-0 right-0 w-1 bg-brand-600" />

              <div className="relative z-10 flex w-full flex-col gap-3 px-5 pt-8 pb-6">
                <h3 className="text-xl font-normal text-white">{tile.title}</h3>
                <p className="text-xs leading-relaxed text-white/80">{tile.description}</p>
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
              key={tile.title}
              className="relative flex aspect-2/1 items-end overflow-hidden bg-brand-600 lg:aspect-[2.1/1]"
            >
              <TileBackground image={tile.image} />

              <div className="relative z-10 flex w-full flex-col items-center gap-4 px-6 pb-8 text-center">
                <h3 className="text-xl font-normal text-white lg:text-2xl">{tile.title}</h3>
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
