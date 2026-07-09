import Image from "next/image";

import { aboutContent } from "@/content/about";
import { withEmphasis } from "@/lib/withEmphasis";

export default function FounderStory() {
  const { heading, paragraph, paragraphHighlights, name, quote, image } = aboutContent.founder;

  return (
    <>
      {/* Mobile: taller portrait photo, all text stacked bottom-left over a scrim */}
      <div className="relative h-212.5 w-full overflow-hidden bg-ink-900 md:hidden">
        <Image src={image} alt={name} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-ink-900/90 via-ink-900/50 to-transparent" />

        <div className="container-page relative z-10 flex h-full flex-col justify-end gap-8 pb-10">
          <div className="space-y-4">
            <h2 className="text-2xl leading-snug font-light text-white">{heading}</h2>
            <p className="text-sm leading-relaxed text-white/85">
              {withEmphasis(paragraph, paragraphHighlights, "font-semibold text-white")}
            </p>
          </div>

          <div>
            <p className="text-base text-white">{name}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80 italic">«{quote}»</p>
          </div>
        </div>
      </div>

      {/* Tablet/desktop: heading top-left, quote bottom-right */}
      <div className="relative hidden h-150 w-full overflow-hidden bg-ink-900 md:block lg:h-175 xl:h-197.5">
        <Image src={image} alt={name} fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-ink-900/50 via-transparent to-ink-900/40" />

        <div className="container-page relative z-10 flex h-full flex-col justify-between py-10 lg:py-16">
          <div className="max-w-md space-y-4 lg:max-w-lg">
            <h2 className="text-2xl leading-snug font-light text-white lg:text-4xl">{heading}</h2>
            <p className="text-sm leading-relaxed text-white/85 lg:text-base">
              {withEmphasis(paragraph, paragraphHighlights, "font-semibold text-white")}
            </p>
          </div>

          <div className="max-w-xs self-end text-right">
            <p className="text-base text-white">{name}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/80 italic">«{quote}»</p>
          </div>
        </div>
      </div>
    </>
  );
}
