import Image from "next/image";
import Link from "next/link";

import { careersContent, type BrandItem } from "@/content/careers";
import { cn } from "@/lib/cn";
import { getCompanies, type Company } from "@/lib/companies";

const RED_RUN = "подходящую вам должность";

/**
 * What the markup below reads, whichever source filled it. Both the live
 * companies and the hand-authored fallback normalise to this.
 */
interface BrandCard {
  key: string | number;
  name: string;
  image: string;
  description: BrandItem["description"];
  /** Empty string means this card renders without its vacancies link. */
  href: string;
}

/**
 * The hand-authored brands, kept as the fallback rather than deleted. Used
 * whenever the request fails, times out, or yields nothing usable — this is a
 * public marketing page, so stale copy beats an empty row.
 */
const STATIC_BRANDS: BrandCard[] = careersContent.brands.items.map((item) => ({
  key: item.name,
  name: item.name,
  image: item.image,
  description: item.description,
  href: item.href,
}));

/**
 * The API sends one flat string where BrandCopy renders paragraphs of inline
 * runs. Blank lines become paragraph breaks — the most structure recoverable
 * from plain text. Bold runs cannot survive the round trip: the static content
 * marks them up per segment and the payload carries no equivalent, so live copy
 * renders unemphasised.
 */
function toDescription(text: string): BrandItem["description"] {
  const paragraphs = text
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return undefined;
  return paragraphs.map((paragraph) => [{ text: paragraph }]);
}

function toBrandCard(company: Company): BrandCard {
  return {
    key: company.id,
    name: company.name,
    // Empty images fall through to the static artwork at the same position,
    // then to the bare `bg-light` frame past the static count.
    image: company.image || (STATIC_BRANDS[0]?.image ?? ""),
    description: toDescription(company.description),
    href: company.vacancies_url.trim(),
  };
}

// The row bleeds to both viewport edges from md up; below that it keeps the
// container's gutter. `-mx-[50vw]` against `left-1/2` is the project's existing
// full-bleed idiom — CategoryGrid and CategoryBanner use the same.
const ROW = cn(
  "mt-10 grid grid-cols-1 items-stretch gap-[8px]",
  "md:relative md:left-1/2 md:-mx-[50vw] md:w-screen md:grid-cols-2",
  "min-[1280px]:grid-cols-4 md:[&>*:nth-child(-n+2)]:pb-[15px]",
);

// Absolute by construction rather than a shared min-height: every panel takes
// its top and bottom edge from the photo it sits on, so the four read as one
// band however long their copy runs. A min-height would still drift as soon as
// one card's text wrapped differently.
const PANEL = cn(
  "absolute bg-white p-[14px] max-md:hidden",
  // < 768 the photo is 4/3, so the panel sits a little higher and inset less.
  "inset-x-[4%] top-[28%] bottom-[4%]",
  "md:inset-x-[3.3%] md:top-[34%] md:bottom-[2.5%]",

  // Visible is the DEFAULT. Only a device that can actually hover opts into
  // hiding it — so anything that cannot (touch, a hybrid tablet at 1024px)
  // degrades to the panel simply being shown, never to an unreachable one. A
  // `lg:` breakpoint would get this backwards.
  //
  // opacity + translate, never display:none or conditional rendering: neither
  // can transition, and remounting on hover flickers. opacity-0 also keeps the
  // copy in the accessibility tree, so a screen reader still reads it.
  //
  // Written out in full rather than composed from a constant — Tailwind
  // extracts candidates from source text, so an interpolated variant never
  // gets generated and the whole effect silently does nothing.
  "transition-[opacity,translate] duration-300 ease-in-out motion-reduce:transition-none",
  "[@media(hover:hover)_and_(pointer:fine)]:pointer-events-none",
  "[@media(hover:hover)_and_(pointer:fine)]:translate-y-[6px]",
  "[@media(hover:hover)_and_(pointer:fine)]:opacity-0",
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:pointer-events-auto",
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:translate-y-0",
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100",
  // focus-within too, so tabbing to the card's link reveals the panel instead
  // of focusing something under an invisible layer.
  "[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:pointer-events-auto",
  "[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:translate-y-0",
  "[@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100",
);

function BrandCopy({
  description,
}: {
  description: NonNullable<BrandItem["description"]>;
}) {
  return (
    <div className="space-y-[14px] overflow-hidden max-md:space-y-3">
      {description.map((paragraph, index) => (
        <p
          key={index}
          className="text-[12px] leading-[1.5] text-ink-900 min-[1024px]:max-[1280px]:text-[11px]"
        >
          {paragraph.map((segment, segmentIndex) =>
            segment.bold ? (
              // Inline <strong>, same size — a bold run inside the sentence,
              // not a block of its own.
              <strong key={segmentIndex} className="font-semibold">
                {segment.text}
              </strong>
            ) : (
              segment.text
            ),
          )}
        </p>
      ))}
    </div>
  );
}

export default async function CareersBrands() {
  const { heading, viewVacanciesLabel } = careersContent.brands;

  // An async server component, not a client fetch: nothing here uses hooks, so
  // awaiting on the server keeps the payload out of the client bundle and
  // resolves the fallback before anything paints. Rendering it from the page
  // needs no change — a server component can await a server child.
  let companies: Company[] = [];
  let fetchError: unknown = null;
  try {
    companies = await getCompanies();
  } catch (error) {
    fetchError = error;
  }

  const usingApi = companies.length > 0;
  const items = usingApi ? companies.map(toBrandCard) : STATIC_BRANDS;

  // Never silent again: whenever the static content stands in, say why.
  if (!usingApi) {
    console.error(
      "[CareersBrands] falling back to static content —",
      fetchError instanceof Error
        ? fetchError.message
        : "request returned an empty or wholly malformed array",
    );
  }
  // text-wrap: balance alone still pulled "и" up onto line 1 — it optimises for
  // even line widths, and "…Deya и" / "найдите…" is the more even split. A
  // no-break space welds "и" to "найдите" so that split is unavailable, which
  // leaves the intended break after "Deya". A rendering concern, not a copy
  // change: the string in careers.ts stays plain.
  const [headingBefore, headingAfter] = heading
    .replace("и найдите", "и\u00A0найдите")
    .split(RED_RUN);

  console.log(items);
  return (
    <div className="py-10 lg:py-24">
      {/* One <h2>: the break onto two lines comes from the max-width, and the
          red run is an inline <span> inside the same element. */}
      <h2 className="mx-auto max-w-[36ch] text-center text-balance font-light text-ink-900 text-[clamp(20px,1.85vw,28px)] leading-[1.3] tracking-[-0.01em]">
        {headingBefore}
        <span className="text-brand-600">{RED_RUN}</span>
        {headingAfter}
      </h2>

      <div className={ROW}>
        {items.map((brand) => (
          <div key={brand.key} className="group flex flex-col max-md:pb-[30px]">
            {/* Full-bleed below md. -mx-10 cancels exactly the two measured
                sources of horizontal padding above it — the single measured
                source of horizontal padding above it — the Section container's
                px-5 (20px per side) — so the photo lands on the viewport edges while the name,
                copy and link keep their inset. A negative margin rather than
                w-screen/100vw: those resolve against the viewport including
                the scrollbar and overflow the page by its width. */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-light max-md:-mx-5 max-md:w-[calc(100%+40px)] md:aspect-3/4">
              <Image
                src={brand.image}
                alt={brand.name}
                fill
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              {brand.description && (
                <div className={PANEL}>
                  <BrandCopy description={brand.description} />
                </div>
              )}
            </div>

            {/* mt-auto pins this group to the bottom of an equal-height column,
                so the names and the links each land on one shared baseline
                whatever the panels above them contain. */}
            <div className="mt-auto flex flex-col items-center text-center max-md:mt-0 max-md:grow max-md:items-start max-md:text-left">
              <h3 className="mt-[35px] font-light text-ink-900 text-[clamp(20px,1.9vw,29px)] leading-[1.15] tracking-[-0.01em] whitespace-nowrap max-md:mt-5">
                {brand.name}
              </h3>

              {/* Below md the description is plain flow content between the
                  name and the link — always visible, no hover, no transition.
                  Hover does not exist on touch, so the reveal has no mobile
                  equivalent. Same BrandCopy as the overlay above; whichever of
                  the two is display:none is out of the accessibility tree, so
                  only one is ever exposed. */}
              {brand.description && (
                <div className="mt-3 hidden w-full text-ink-700 max-md:block">
                  <BrandCopy description={brand.description} />
                </div>
              )}

              {/* Omitted entirely when vacancies_url is empty — never a dead
                  href="". target/rel are added only for an off-site absolute
                  URL, so the static fallback's in-page "#" keeps behaving as it
                  does today instead of opening a second tab onto itself. */}
              {brand.href && (
                <Link
                  href={brand.href}
                  {...(/^https?:\/\//i.test(brand.href)
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="mt-[30px] max-md:mt-auto max-md:pt-5 font-normal text-ink-900 text-[clamp(10px,0.78vw,12px)] tracking-[0.04em] uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-brand-600"
                >
                  {viewVacanciesLabel.toUpperCase()}
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
