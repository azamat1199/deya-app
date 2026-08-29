import type { Metadata } from "next";
import { notFound } from "next/navigation";

import AboutPreview from "@/components/home/AboutPreview";
import CategoryGrid, {
  type CategoryGridItem,
} from "@/components/home/CategoryGrid";
import ExportMap from "@/components/home/ExportMap";
import FeaturedProducts, {
  type FeaturedProductItem,
} from "@/components/home/FeaturedProducts";
import HeroSlider from "@/components/home/HeroSlider";
import NewsTeaser from "@/components/home/NewsTeaser";
import type { NewsTeaserItem } from "@/components/home/NewsTeaser.types";
import { Section, ScrollReveal } from "@/components/ui";
import { homeCategories } from "@/content/categories";
import { IMAGES } from "@/content/images";
import { newsPosts } from "@/content/news";
import { featuredProducts } from "@/content/products";
import { slides as staticSlides } from "@/content/slides";
import { stats as staticStats } from "@/content/stats";
import type { Slide, StatItem } from "@/content/types";
import {
  getHome,
  type HomeCategory,
  type HomeFeaturedProduct,
  type HomePost,
  type HomeSlide,
  type HomeStat,
} from "@/lib/home";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/getDictionary";
import { badgeLabel } from "@/lib/products";

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const dictionary = await getDictionary(locale);
  return { title: dictionary.home.placeholderTitle };
}

/**
 * Leading digits of "32+" → 32. Fed to Stat purely to drive its existing
 * count-up animation; `value` itself is passed through untouched, so what
 * renders is the API's own string including its "+", "%" or "K". A value with
 * no leading digits gets 0, which Stat detects and renders verbatim instead.
 */
function leadingNumber(value: string): number {
  const match = value.match(/^\d+/);
  return match ? Number(match[0]) : 0;
}

/**
 * The CTA every static slide carries. Both entries in content/slides.ts hold
 * the identical pair, so this is one site-wide default rather than a per-slide
 * mapping — which is what makes it safe to apply to an API slide that has no
 * static counterpart at all.
 *
 * The static href is locale-less. src/proxy.ts redirects a bare "/catalog" to
 * the DEFAULT locale, so it is prefixed with the active one here; without that
 * a visitor on /uz would be bounced to the Russian catalog.
 */
const STATIC_CTA = {
  label: staticSlides[0]?.ctaLabel ?? "",
  href: staticSlides[0]?.ctaHref ?? "",
};

/**
 * Per-field fallback for a CMS row that exists but left strings blank — a
 * different failure from the whole request failing, and one the static content
 * can partly cover.
 *
 * Matched BY TITLE, never by index: the API currently returns three slides
 * against the mock's two, so index n on one side is not the same slide as
 * index n on the other. A slide with no title match keeps an empty subtitle
 * rather than borrowing another slide's prose — wrong copy reads worse than
 * no copy. The CTA is exempt because it is not slide-specific (see above).
 */
function toHeroSlide(slide: HomeSlide, locale: string, notes: string[]): Slide {
  const staticMatch = staticSlides.find(
    (candidate) => candidate.title.trim() === slide.title.trim(),
  );

  let description = slide.subtitle;
  if (!description) {
    description = staticMatch?.description ?? "";
    notes.push(
      description
        ? `slides[id=${slide.id}].subtitle ← static "${staticMatch?.id}"`
        : `slides[id=${slide.id}].subtitle EMPTY, no static slide titled "${slide.title}"`,
    );
  }

  // Guarded as a PAIR: a half-filled CTA is as unusable as an empty one, so
  // either blank field falls the whole button back to the static default.
  let ctaLabel = slide.cta_label;
  let ctaHref = slide.cta_url;
  if (!ctaLabel || !ctaHref) {
    ctaLabel = STATIC_CTA.label;
    ctaHref = STATIC_CTA.href ? `/${locale}${STATIC_CTA.href}` : "";
    notes.push(`slides[id=${slide.id}].cta_label/cta_url ← static CTA`);
  }

  return {
    id: String(slide.id),
    title: slide.title,
    description,
    // Still collapsed to undefined as a pair, so a missing static default
    // cannot produce href="" or a button with an empty label either.
    ctaLabel: ctaLabel || undefined,
    ctaHref: ctaHref || undefined,
    // Empty image → the static hero photograph, never an empty src.
    image: slide.image || IMAGES.heroFactory,
  };
}

/**
 * Matched BY VALUE, not by index: the four static values ("32+", "25", "60",
 * "90") are exactly the four the API returns, so the value is a real key here
 * and a reordered or trimmed API list still lands on the right caption.
 * The number itself always comes from the API.
 */
function toStatItem(stat: HomeStat, notes: string[]): StatItem {
  let label = stat.label;
  if (!label) {
    label =
      staticStats.find((candidate) => candidate.value === stat.value)?.label ??
      "";
    notes.push(
      label
        ? `stats[id=${stat.id}].label ← static "${stat.value}"`
        : `stats[id=${stat.id}].label EMPTY, no static stat valued "${stat.value}"`,
    );
  }

  return {
    id: String(stat.id),
    value: stat.value,
    numericValue: leadingNumber(stat.value),
    label,
  };
}

function toCategoryTile(category: HomeCategory): CategoryGridItem {
  return {
    id: category.id,
    slug: category.slug,
    title: category.name,
    image: category.image || IMAGES.placeholder,
  };
}

function toFeaturedCard(
  product: HomeFeaturedProduct,
  locale: string,
): FeaturedProductItem {
  return {
    id: product.id,
    // The PRODUCT name, never category.name.
    title: product.name,
    image: product.main_image?.image || IMAGES.placeholder,
    href: `/${locale}/catalog/${product.category.slug}/${product.slug}`,
    // Shared with the catalog grid rather than a second copy of the mapping.
    // Returns undefined for a null/unknown badge, so no chip is rendered.
    badge: badgeLabel(product.badge),
  };
}

function toTeaserItem(post: HomePost, locale: string): NewsTeaserItem {
  return {
    id: String(post.id),
    // ISO 8601 UTC; NewsListCard formats it with Intl for the active locale.
    date: post.published_at,
    title: post.title,
    excerpt: post.excerpt,
    href: `/${locale}/blog/${post.slug}`,
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dictionary = await getDictionary(locale as Locale);

  // THE one request this page makes. Six sections, one round trip: no component
  // below fetches anything of its own, and /api/v1/categories/ and
  // /api/v1/posts/ are deliberately NOT called here — their rows are already in
  // this body. (The layout separately fetches /api/v1/settings/ for the header
  // and footer, which is not this page's request.)
  const home = await getHome(locale);

  // null means the REQUEST failed, and every section falls back to its static
  // content at once — getHome has already logged the one error with its cause.
  // An empty array from a SUCCESSFUL response is not a failure: it means the
  // section has no rows, and the section is hidden below rather than quietly
  // refilled with mock content.
  // Collected across every adapter below and reported in ONE console.warn, so
  // a CMS row left half-filled stays visible to us instead of quietly looking
  // like a finished page.
  const fallbackNotes: string[] = [];

  const heroSlides: Slide[] = home
    ? home.slides.map((slide) => toHeroSlide(slide, locale, fallbackNotes))
    : staticSlides;

  const statItems: StatItem[] = home
    ? home.stats.map((stat) => toStatItem(stat, fallbackNotes))
    : staticStats;

  const categoryTiles: CategoryGridItem[] = home
    ? home.categories.map(toCategoryTile)
    : homeCategories.map((category) => ({
        id: category.slug,
        slug: category.slug,
        title: category.title,
        image: category.image,
      }));

  const featuredCards: FeaturedProductItem[] = home
    ? home.featured_products.map((product) => toFeaturedCard(product, locale))
    : featuredProducts.map((product) => ({
        id: product.slug,
        title: product.title,
        image: product.image,
        href: `/${locale}/catalog/${product.categorySlug}/${product.slug}`,
        badge: product.badge,
      }));

  // An empty array is what ExportMap treats as "no data" — it then keeps the
  // static labels rather than drawing an unlabelled map. That is deliberate and
  // agreed, but it is the one case where content/regions.ts reaches the screen,
  // so it is logged here. A failed request is already logged by getHome, with
  // its cause; this covers the successful-but-empty case it cannot see.
  const exportRegions = home ? home.export_regions : [];
  if (home && home.export_regions.length === 0) {
    console.error(
      `[HomePage] /api/v1/home/ returned an EMPTY export_regions array on /${locale} — the map is falling back to the static labels in content/regions.ts. Populate the regions in the CMS.`,
    );
  }

  const teaserItems: NewsTeaserItem[] = home
    ? home.latest_posts.map((post) => toTeaserItem(post, locale))
    : newsPosts.map((post) => ({
        id: post.slug,
        date: post.date,
        title: post.title,
        excerpt: post.excerpt,
        href: `/${locale}/blog/${post.slug}`,
      }));

  // One warning per render, never one per field — a four-line burst per stat
  // would be scrolled past and ignored.
  if (fallbackNotes.length > 0) {
    console.warn(
      `[HomePage] ${fallbackNotes.length} empty CMS field(s) fell back to static content on /${locale} — fix these in the CMS:\n  ${fallbackNotes.join("\n  ")}`,
    );
  }

  return (
    <>
      {heroSlides.length > 0 && (
        <ScrollReveal direction="fade">
          <HeroSlider slides={heroSlides} />
        </ScrollReveal>
      )}

      {statItems.length > 0 && (
        <Section bg="white" containerWidth="home">
          <AboutPreview locale={locale as Locale} stats={statItems} />
        </Section>
      )}

      {categoryTiles.length > 0 && (
        <Section bg="white" containerWidth="home">
          <ScrollReveal direction="fade">
            <CategoryGrid
              locale={locale as Locale}
              toCatalogLabel={dictionary.buttons.toCatalog}
              categories={categoryTiles}
            />
          </ScrollReveal>
        </Section>
      )}

      {/* <Section bg="white" containerWidth="home">
        <ScrollReveal> */}
      {featuredCards.length > 0 && (
        <FeaturedProducts
          locale={locale as Locale}
          allCatalogLabel={dictionary.buttons.allCatalog}
          products={featuredCards}
        />
      )}
      {/* </ScrollReveal>
      </Section> */}

      {/* overflow-x-clip absorbs the scrollbar-width overshoot from the
          full-bleed 100vw children inside ExportMap (clip, not hidden, so it
          doesn't create a scroll container and break sticky/reveal). */}
      <Section
        containerWidth="page"
        className="overflow-x-clip"
        style={{ backgroundColor: "var(--color-cream-50)" }}
      >
        <ExportMap regions={exportRegions} />
      </Section>

      {/* Hidden outright when there are no posts, rather than falling through
          to NewsTeaser's own `emptyLabel` state — that branch stays in the
          component for its other callers. */}
      {teaserItems.length > 0 && (
      <Section bg="cream50" containerWidth="page">
        <NewsTeaser
          items={teaserItems}
          locale={locale as Locale}
          heading={dictionary.home.newsTeaser.heading}
          allNewsHref={`/${locale}/blog`}
          allNewsLabel={dictionary.buttons.allNews}
          readMoreLabel={dictionary.buttons.readMore}
          emptyLabel={dictionary.home.newsTeaser.empty}
        />
      </Section>
      )}
    </>
  );
}
