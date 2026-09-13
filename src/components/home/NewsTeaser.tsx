// Required by the mobile branch: Slider is a client component and renderSlide
// is a function, which cannot cross the server/client boundary as a prop.
// CareersAbout carries the same directive for the same reason.
"use client";

import Link from "next/link";

import NewsListCard, {
  ALL_NEWS_LINK_CLASSES,
  NEWS_LIST_CELL_CLASSES,
  NEWS_LIST_GRID_CLASSES,
} from "@/components/news/NewsListCard";
import { ScrollReveal, Slider } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { NewsTeaserItem, NewsTeaserProps } from "./NewsTeaser.types";

export type { NewsTeaserItem, NewsTeaserProps } from "./NewsTeaser.types";

/**
 * The home teaser shows the newest four only. Applied here rather than in
 * content/news.ts because that array is also read by the blog listing, the
 * blog detail route and OtherArticles, all of which need the full twelve.
 * NewsTeaser has exactly one consumer — the home page — so scoping the limit
 * to this component is equivalent to scoping it to that usage.
 */
const HOME_NEWS_LIMIT = 4;

export default function NewsTeaser({
  items,
  locale,
  heading,
  allNewsHref,
  allNewsLabel,
  readMoreLabel,
  emptyLabel,
}: NewsTeaserProps) {
  const visibleItems = items.slice(0, HOME_NEWS_LIMIT);

  // One definition of the card for both branches, so the slider and the grid
  // can never drift apart.
  const renderCard = (item: NewsTeaserItem) => (
    <NewsListCard
      id={item.id}
      href={item.href}
      date={item.date}
      title={item.title}
      excerpt={item.excerpt}
      locale={locale}
      readMoreLabel={readMoreLabel}
    />
  );

  return (
    // No bottom margin: the section butts straight up against the footer's
    // solid top strip.
    <div className="pt-16 pb-12 lg:pt-32 lg:pb-16">
      <ScrollReveal direction="up">
        {/* items-baseline so the small uppercase link sits on the h2's baseline
            rather than being centred against its much larger line box. */}
        <div className="flex items-baseline justify-between gap-6">
          {/* Mobile heading: Roboto 300 / 24px / 110% / -3%. `max-md:` because
              this h2 is shared with the desktop layout — the unprefixed
              text-3xl and lg:text-[38px] below 768px are what the phone was
              showing (30px), and both have to stay exactly as they are above
              it. font-light is already the 300 the spec asks for. */}
          <h2 className="text-3xl leading-tight font-light text-ink-900 max-md:text-[24px] max-md:leading-[1.1] max-md:tracking-[-0.03em] lg:text-[38px]">
            {heading}
          </h2>
          <Link
            href={allNewsHref}
            className={cn(
              "hidden shrink-0 md:inline-block",
              ALL_NEWS_LINK_CLASSES,
            )}
          >
            {allNewsLabel}
          </Link>
        </div>
      </ScrollReveal>

      {visibleItems.length === 0 ? (
        <ScrollReveal direction="fade">
          <p className="mt-10 text-sm text-ink-500 min-[1024px]:mt-[90px]">
            {emptyLabel}
          </p>
        </ScrollReveal>
      ) : (
        <>
          {/* Phone: one card per view, swipe-driven with dot pagination —
              the same two-branch shape CareersAbout uses. Dragging is embla's
              own behaviour, so there are no gesture handlers here. The cell
              classes are deliberately absent: they draw the rules between
              stacked cards, which a one-per-view carousel has no use for. */}
          <div
            className={cn(
              // `relative` anchors the ВСЕ НОВОСТИ link below.
              "relative mt-10 md:hidden",
              // The mobile type spec for the card. Applied as descendant
              // overrides from here rather than edited into NewsListCard,
              // because that card is shared with the /blog listing and with
              // the md+ grid directly below — both of which keep their current
              // type. Scoped to this `md:hidden` wrapper, so it is mobile-only
              // by construction and cannot reach either of them.
              //
              // These win on specificity, not on class order: each compiles to
              // `.<class> h3` (0,1,1), which outranks the (0,1,0) utility the
              // card sets on the element itself. cn() is plain clsx and merges
              // nothing, so relying on order here would be a coin flip.
              //
              // News title — Roboto 300 / 18px / 110% / -3%.
              "[&_h3]:text-[18px] [&_h3]:leading-[1.1] [&_h3]:font-light [&_h3]:tracking-[-0.03em]",
              // Description — Roboto 400 / 13px / 135% / 0.
              "[&_p]:text-[13px] [&_p]:leading-[1.35] [&_p]:font-normal [&_p]:tracking-normal",
              // Date. NOT a Figma measurement — see the note in the PR: the
              // spec omitted it and the Figma file could not be opened, so
              // this takes the fallback the brief itself offers, the
              // description's type style at the card's existing lighter
              // colour (text-ink-400, left untouched). Flagged for
              // confirmation rather than guessed at independently.
              "[&_time]:text-[13px] [&_time]:leading-[1.35] [&_time]:font-normal [&_time]:tracking-normal",
              // ЧИТАТЬ БОЛЬШЕ — Roboto 400 / 12px / 120% / 0. The card's only
              // <span> is that label. The spec's `border: 1px solid #00000080`
              // is applied as the UNDERLINE's colour, not as a box: see the
              // note on the link below.
              "[&_span]:text-[12px] [&_span]:leading-[1.2] [&_span]:font-normal [&_span]:tracking-normal [&_span]:decoration-[#00000080]",
            )}
          >
            <Slider
              items={visibleItems}
              slidesPerView={1}
              gap={10}
              showPagination
              renderSlide={(item) => (
                // This wrapper is the overflow fix. ui/Slider gives its track
                // `margin-inline: -gap/2` (-5px here) and then sizes each slide
                // at 100% of that widened track, so every slide came out 10px
                // wider than the column and started 5px to its LEFT — which is
                // why the date, title, excerpt and read-more label were all
                // sheared off on the left by the viewport's overflow-hidden
                // and ran 5px past the right gutter. Measured at 320/360/390/
                // 430: clipped by exactly 5px on each side at every width.
                //
                // Giving the content back those 5px per side lands it on the
                // container's real 20px gutters while leaving the track itself
                // alone, so the 10px gap BETWEEN slides is still 10px and the
                // carousel's behaviour, slide count and dots are untouched.
                //
                // h-full keeps the equal-height chain intact: the flex track
                // stretches the slide, this passes that height down, and the
                // card's own h-full then pins its read-more label to the
                // bottom. Without it the label would sit at each card's own
                // content height and the link below would stop lining up.
                <div className="mx-[5px] h-full">{renderCard(item)}</div>
              )}
            />

            {/* Figma puts ВСЕ НОВОСТИ on the SAME row as the card's ЧИТАТЬ
                БОЛЬШЕ, right-aligned, with the dots under both; it had drifted
                below the dots as a centred block. It cannot simply join that
                row in the markup — the row belongs to NewsListCard and repeats
                per slide, while this link is one per section — so it is
                anchored to the row instead.

                bottom-8 = 32px = exactly what Slider's pagination adds under
                the viewport (`mt-6` + the dots' `h-2`), which puts this link's
                bottom edge on the viewport's bottom edge. The card's read-more
                label is its last line and is pinned there by mt-auto, and both
                are now 12px/120% line boxes, so the two sit on one line.

                `background: #000000` from the spec is this link's UNDERLINE,
                not a filled box — decoration-[#000000] below. Same reading as
                the card's `border: 1px solid #00000080`: the reference
                screenshot shows both as underlined text links, one with a
                black rule and one with a 50%-black rule, and building them as
                boxes would put two solid buttons where the design has none.
                Figma could not be opened to confirm — flagged in the PR. */}
            <Link
              href={allNewsHref}
              className={cn(
                "absolute right-0 bottom-8",
                ALL_NEWS_LINK_CLASSES,
                // max-md: so these beat ALL_NEWS_LINK_CLASSES' own text-xs /
                // font-medium / tracking-[0.08em] on cascade order rather than
                // on luck — a variant sorts after every unprefixed utility.
                "max-md:text-[12px] max-md:leading-[1.2] max-md:font-normal max-md:tracking-normal max-md:decoration-[#000000]",
              )}
            >
              {allNewsLabel}
            </Link>
          </div>

          {/* Tablet/desktop: the existing grid, unchanged. The show/hide lives
              on a wrapper rather than on the grid itself — `hidden md:block`
              on the grid would override its own display:grid and collapse the
              columns. */}
          <div className="hidden md:block">
            <div
              className={cn(
                "mt-10 min-[1024px]:mt-[90px]",
                NEWS_LIST_GRID_CLASSES,
              )}
            >
              {visibleItems.map((item, index) => (
                <ScrollReveal
                  key={item.id}
                  direction="up"
                  delay={index * 0.08}
                  className={NEWS_LIST_CELL_CLASSES}
                >
                  {renderCard(item)}
                </ScrollReveal>
              ))}
            </div>
          </div>
        </>
      )}

      {/* The mobile ВСЕ НОВОСТИ link used to live here — full-width and
          centred, which is what put it BELOW the dots. It now sits on the
          card's read-more row inside the carousel wrapper above; there is no
          second copy. The md+ header link is unchanged. */}
    </div>
  );
}
