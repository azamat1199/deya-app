import Image from "next/image";

import { careersContent } from "@/content/careers";

export default function CareersCulture() {
  const { heading, quote, paragraphs, image } = careersContent.culture;
  const [headingBefore, headingAfter] = heading.split("Deya");

  return (
    <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:gap-16 lg:py-24">
      <div>
        <h2 className="text-3xl leading-snug font-normal text-ink-900 lg:text-4xl">
          {headingBefore}
          <span className="text-brand-600">Deya</span>
          {headingAfter}
        </h2>

        <p className="mt-6 text-base italic leading-relaxed text-ink-700 lg:text-lg">{quote}</p>

        <div className="mt-6 space-y-4">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-relaxed text-ink-700 lg:text-base">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-light">
        <Image
          src={image}
          alt={heading}
          fill
          sizes="(min-width: 1024px) 45vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  );
}
