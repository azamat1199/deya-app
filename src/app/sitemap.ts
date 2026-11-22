import type { MetadataRoute } from "next";

import { defaultLocale, locales } from "@/lib/i18n/config";
import { getPosts } from "@/lib/posts";
import { getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

/**
 * /sitemap.xml — every page under every locale, each entry carrying the full
 * hreflang set so search engines see the three languages as one page.
 *
 * Product and post slugs are locale-independent (only the text is
 * translated), so one list fetch per type, in the default locale, is enough.
 * A failed fetch drops that type from the sitemap rather than failing the
 * whole file — the static pages are always listed.
 *
 * Cached like the pages: regenerated on the fetches' 300s revalidate window.
 */

/** Locale-less paths of the pages that exist under every locale. */
const STATIC_PATHS: { path: string; priority: number }[] = [
  { path: "", priority: 1 },
  { path: "/catalog", priority: 0.9 },
  { path: "/about", priority: 0.7 },
  { path: "/partners", priority: 0.7 },
  { path: "/blog", priority: 0.6 },
  { path: "/careers", priority: 0.5 },
  { path: "/contacts", priority: 0.6 },
  { path: "/privacy-policy", priority: 0.2 },
  { path: "/personal-data-consent", priority: 0.2 },
];

function entries(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const locale of locales) languages[locale] = `${SITE_URL}/${locale}${path}`;
  languages["x-default"] = `${SITE_URL}/${defaultLocale}${path}`;

  return locales.map((locale) => ({
    url: `${SITE_URL}/${locale}${path}`,
    alternates: { languages },
    ...extra,
  }));
}

async function productPaths(): Promise<string[]> {
  try {
    const products = await getProducts(defaultLocale);
    return products.map((p) => `/catalog/${p.category.slug}/${p.slug}`);
  } catch (error) {
    console.error(
      "[sitemap] products failed, omitting them —",
      error instanceof Error ? error.message : String(error),
    );
    return [];
  }
}

async function postEntries(): Promise<{ path: string; lastModified?: Date }[]> {
  try {
    const { posts } = await getPosts({ locale: defaultLocale, pageSize: 500 });
    return posts.map((post) => {
      const published = Date.parse(post.published_at);
      return {
        path: `/blog/${post.slug}`,
        ...(Number.isNaN(published) ? {} : { lastModified: new Date(published) }),
      };
    });
  } catch (error) {
    console.error(
      "[sitemap] posts failed, omitting them —",
      error instanceof Error ? error.message : String(error),
    );
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts] = await Promise.all([productPaths(), postEntries()]);

  return [
    ...STATIC_PATHS.flatMap(({ path, priority }) =>
      entries(path, { priority, changeFrequency: "weekly" }),
    ),
    ...products.flatMap((path) =>
      entries(path, { priority: 0.8, changeFrequency: "weekly" }),
    ),
    ...posts.flatMap(({ path, lastModified }) =>
      entries(path, { priority: 0.5, changeFrequency: "monthly", lastModified }),
    ),
  ];
}
