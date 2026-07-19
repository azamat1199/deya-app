import Image from "next/image";
import Link from "next/link";

import { careersContent, type BrandItem } from "@/content/careers";

function BrandDescription({ description }: { description: NonNullable<BrandItem["description"]> }) {
  return (
    <div className="mt-4 space-y-4">
      {description.map((paragraph, index) => (
        <p key={index} className="text-sm leading-relaxed text-ink-700">
          {paragraph.map((segment, segmentIndex) =>
            segment.bold ? (
              <span key={segmentIndex} className="font-semibold text-ink-900">
                {segment.text}
              </span>
            ) : (
              segment.text
            ),
          )}
        </p>
      ))}
    </div>
  );
}

export default function CareersBrands() {
  const { heading, viewVacanciesLabel, items } = careersContent.brands;
  const [headingBefore, headingAfter] = heading.split("подходящую вам должность");

  return (
    <div className="py-16 lg:py-24">
      <h2 className="mx-auto max-w-2xl text-center text-2xl leading-snug font-normal text-ink-900 lg:text-3xl">
        {headingBefore}
        <span className="text-brand-600">подходящую вам должность</span>
        {headingAfter}
      </h2>

      {/* Phone: single-column stacked cards with the full description when available. */}
      <div className="mt-10 flex flex-col gap-12 md:hidden">
        {items.map((brand) => (
          <div key={brand.name}>
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-light">
              <Image src={brand.image} alt={brand.name} fill sizes="100vw" className="object-cover" />
            </div>
            <h3 className="mt-5 text-2xl font-normal text-ink-900">{brand.name}</h3>
            {brand.description && <BrandDescription description={brand.description} />}
            <Link
              href={brand.href}
              className="mt-4 inline-block text-xs font-medium tracking-wide text-ink-700 underline underline-offset-4 transition-colors hover:text-brand-600"
            >
              {viewVacanciesLabel.toUpperCase()}
            </Link>
          </div>
        ))}
      </div>

      {/* Tablet/desktop: compact grid, name + link only. */}
      <div className="mt-14 hidden gap-8 md:grid md:grid-cols-2 lg:grid-cols-4">
        {items.map((brand) => (
          <div key={brand.name} className="flex flex-col items-center text-center">
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg bg-light">
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                sizes="(min-width: 1200px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <span className="mt-5 text-lg font-normal text-ink-900 lg:text-xl">{brand.name}</span>
            <Link
              href={brand.href}
              className="mt-2 text-xs font-medium tracking-wide text-ink-700 underline underline-offset-4 transition-colors hover:text-brand-600 lg:text-sm"
            >
              {viewVacanciesLabel.toUpperCase()}
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
