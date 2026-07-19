import Image from "next/image";

import { Button } from "@/components/ui";
import { careersContent } from "@/content/careers";

export interface CareersHeroProps {
  vacanciesLabel: string;
}

export default function CareersHero({ vacanciesLabel }: CareersHeroProps) {
  return (
    <div className="relative w-full overflow-hidden bg-ink-900">
      <div className="relative h-125 w-full md:h-150 lg:h-175 xl:h-197.5">
        <Image
          src={careersContent.image}
          alt={careersContent.heading}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-ink-900/50" />

        {/* Phone: heading only overlaid on the image; description + CTA live below in flow. */}
        <div className="container-page relative z-10 flex h-full items-end pb-8 md:hidden">
          <h1 className="max-w-xs text-4xl font-light text-white">{careersContent.heading}</h1>
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
            <Button variant="white" size="lg" href="#" className="mt-6">
              {vacanciesLabel}
            </Button>
          </div>
        </div>
      </div>

      <div className="container-page bg-white py-8 md:hidden">
        <p className="text-sm leading-relaxed text-ink-700">{careersContent.description}</p>
        <Button variant="outline" size="lg" href="#" fullWidth className="mt-6">
          {vacanciesLabel}
        </Button>
      </div>
    </div>
  );
}
