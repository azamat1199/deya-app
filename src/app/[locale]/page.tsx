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
import { stats as staticStats } from "@/content/stats";
import type { Slide, StatItem } from "@/content/types";
import { getBanners, type Banner } from "@/lib/banners";
import {
  getHome,
  type HomeCategory,
  type HomeFeaturedProduct,
  type HomePost,
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
 * One `main` banner as HeroSlider's existing Slide shape.
 *
 * The hero's copy now comes from GET /api/v1/banners/ type="main" rather than
 * /api/v1/home/'s own `slides` — the two carry the same three rows, but the
 * banners endpoint has the subtitles filled in while home.slides sends "" for
 * every one of them. No per-field static fallback is layered underneath any
 * more: this project's rule (see CareersCulture) is that API data replaces
 * static content rather than sitting on top of it.
 *
 * `subtitle` becomes `description` — HeroSlider's own name for the same field.
 *
 * `badge` is deliberately NOT set: the endpoint has no such field, so it stays
 * undefined and HeroSlider's always-present 24px badge slot renders empty,
 * exactly as it does today. Inventing one would change the design.
 *
 * The catalog CTA is NOT the banner's cta_label/cta_url — those are ignored
 * here on purpose. The button keeps pointing at the catalog, with its label
 * from the dictionary (buttons.viewCatalog) instead of the static slides mock
 * it used to read, which is what keeps mock strings out of the render path.
 * The href is locale-prefixed: src/proxy.ts redirects a bare "/catalog" to the
 * DEFAULT locale, so a visitor on /uz would otherwise land on the Russian one.
 */
function toHeroSlide(
  banner: Banner,
  locale: string,
  catalogLabel: string,
): Slide {
  return {
    id: String(banner.id),
    title: banner.title,
    description: banner.subtitle,
    ctaLabel: catalogLabel || undefined,
    ctaHref: `/${locale}/catalog`,
    // Empty image → the static hero photograph, never an empty src.
    image: banner.image || IMAGES.heroFactory,
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

  // Two requests now, in parallel: /api/v1/home/ still feeds five sections
  // (stats, categories, featured_products, export_regions, latest_posts), and
  // /api/v1/banners/ feeds the hero, which used to come from home.slides.
  // Neither depends on the other. No component below fetches anything of its
  // own, and /api/v1/categories/ and /api/v1/posts/ are deliberately NOT
  // called here — their rows are already in the home body. (The layout
  // separately fetches /api/v1/settings/ for the header and footer, which is
  // not this page's request.)
  //
  // Above the fold, so server-side only: a useEffect would flash an empty hero
  // and this API sends no Access-Control-Allow-Origin anyway. Neither helper
  // rejects — each logs its own failure with `cause` and answers null / [].
  const [home, banners] = await Promise.all([
    getHome(locale),
    getBanners(locale),
  ]);
  const mainBanners = banners.filter((banner) => banner.type === "main");

  // null means the REQUEST failed, and every section falls back to its static
  // content at once — getHome has already logged the one error with its cause.
  // An empty array from a SUCCESSFUL response is not a failure: it means the
  // section has no rows, and the section is hidden below rather than quietly
  // refilled with mock content.
  // Collected by the stats adapter — the only one with a per-field static
  // fallback left, now that the hero reads from /api/v1/banners/ — and
  // reported in ONE console.warn, so a CMS row left half-filled stays visible
  // to us instead of quietly looking like a finished page.
  const fallbackNotes: string[] = [];

  // Sourced from /api/v1/banners/ type="main", NOT home.slides — see
  // toHeroSlide. Rendered in id order, which is also the order the endpoint
  // returns today. No static fallback: an empty list hides the slider below
  // rather than showing mock copy as the first thing a visitor sees.
  const heroSlides: Slide[] = mainBanners.map((banner) =>
    toHeroSlide(banner, locale, dictionary.buttons.viewCatalog),
  );

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

      {featuredCards.length > 0 && (
        <FeaturedProducts
          locale={locale as Locale}
          allCatalogLabel={dictionary.buttons.allCatalog}
          products={featuredCards}
        />
      )}

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
