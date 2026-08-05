import Link from "next/link";

import NewsListCard, {
  ALL_NEWS_LINK_CLASSES,
  NEWS_LIST_CELL_CLASSES,
  NEWS_LIST_GRID_CLASSES,
} from "@/components/news/NewsListCard";
import { ScrollReveal } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { NewsTeaserProps } from "./NewsTeaser.types";

export type { NewsTeaserItem, NewsTeaserProps } from "./NewsTeaser.types";

export default function NewsTeaser({
  items,
  locale,
  heading,
  allNewsHref,
  allNewsLabel,
  readMoreLabel,
  emptyLabel,
}: NewsTeaserProps) {
  return (
    // No bottom margin: the section butts straight up against the footer's
    // solid top strip.
    <div className="pt-16 pb-12 lg:pt-32 lg:pb-16">
      <ScrollReveal direction="up">
        {/* items-baseline so the small uppercase link sits on the h2's baseline
            rather than being centred against its much larger line box. */}
        <div className="flex items-baseline justify-between gap-6">
          <h2 className="text-3xl leading-tight font-light text-ink-900 lg:text-[38px]">
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

      {items.length === 0 ? (
        <ScrollReveal direction="fade">
          <p className="mt-10 text-sm text-ink-500 min-[1024px]:mt-[90px]">
            {emptyLabel}
          </p>
        </ScrollReveal>
      ) : (
        <div
          className={cn("mt-10 min-[1024px]:mt-[90px]", NEWS_LIST_GRID_CLASSES)}
        >
          {items.map((item, index) => (
            <ScrollReveal
              key={item.id}
              direction="up"
              delay={index * 0.08}
              className={NEWS_LIST_CELL_CLASSES}
            >
              <NewsListCard
                id={item.id}
                href={item.href}
                date={item.date}
                title={item.title}
                excerpt={item.excerpt}
                locale={locale}
                readMoreLabel={readMoreLabel}
              />
            </ScrollReveal>
          ))}
        </div>
      )}

      {/* Below 768 the header link moves under the list as a full-width,
          centred link. */}
      <Link
        href={allNewsHref}
        className={cn(
          "mt-12 block text-center md:hidden",
          ALL_NEWS_LINK_CLASSES,
        )}
      >
        {allNewsLabel}
      </Link>
    </div>
  );
}
