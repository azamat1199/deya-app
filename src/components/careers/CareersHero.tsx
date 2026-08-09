import Image from "next/image";

import { Button } from "@/components/ui";
import { careersContent } from "@/content/careers";

export interface CareersHeroProps {
  vacanciesLabel: string;
}

export default function CareersHero({ vacanciesLabel }: CareersHeroProps) {
  return (
    <div className="relative w-full overflow-hidden bg-ink-900">
      <div className="relative h-125 w-full max-md:h-dvh md:h-150 lg:h-175 xl:h-197.5">
        <Image
          src={careersContent.image}
          alt={careersContent.heading}
          fill
          priority
          sizes="100vw"
          className="object-cover max-md:object-[50%_38%]"
        />
        <div className="absolute inset-0 bg-ink-900/50" />

        {/* Phone: additional bottom scrim so the paragraph stays legible over
            the lighter parts of the photo. Sits above the flat overlay and
            below the copy. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.72)_0%,rgba(0,0,0,0.35)_32%,rgba(0,0,0,0)_55%)] md:hidden"
        />

        {/* Phone: everything overlaid on the photo in three rows — h1 under the
            header, an empty spacer taking the slack, copy + CTA on the floor.
            A flex column with justify-end would pile the slack ABOVE the h1 and
            push it down the frame. The offset comes from --header-height, the
            token the Header sizes itself with; min() stops it collapsing the
            gap on a 640px-tall device. container-page puts all three on the
            same left edge as the logo, set once here. */}
        <div className="container-page relative z-10 grid h-full grid-rows-[auto_1fr_auto] pt-[calc(var(--header-height)_+_min(6vh,48px))] pb-[calc(30px_+_env(safe-area-inset-bottom))] md:hidden">
          <h1 className="max-w-xs font-light text-white text-[clamp(30px,8.5vw,38px)] leading-[1.05] tracking-[-0.03em]">
            {careersContent.heading}
          </h1>

          <div aria-hidden="true" />

          <div>
            <p className="font-normal text-white/90 text-[clamp(14px,3.9vw,16px)] leading-[1.4] tracking-[-0.02em]">
              {careersContent.description}
            </p>
            <Button
              variant="white"
              size="lg"
              href="#"
              fullWidth
              className="mt-[26px] h-[52px] text-[12px] tracking-[0.05em]"
            >
              {vacanciesLabel}
            </Button>
          </div>
        </div>

        {/* Tablet/desktop: heading + description + CTA all overlaid at the bottom of the image. */}
        <div className="container-page relative z-10 hidden h-full flex-col justify-end gap-8 pb-16 md:flex lg:flex-row lg:items-end lg:justify-between lg:gap-10 lg:pb-20">
          <h1 className="max-w-xl text-5xl font-light text-white lg:text-7xl">
            {careersContent.heading}
          </h1>

          <div className="max-w-sm lg:pb-2">
            <p className="text-sm leading-relaxed text-white/85 lg:text-base">
              {careersContent.description}
            </p>
            <Button variant="white" size="lg" href="#" className="mt-6 w-full">
              {vacanciesLabel}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
