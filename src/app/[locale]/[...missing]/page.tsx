import { notFound } from "next/navigation";

/**
 * Any path under a locale that no other route matches (/ru/foo, /en/a/b/c).
 * Without this, an unmatched URL would skip the locale layout and fall through
 * to Next's bare built-in 404; here it renders [locale]/not-found with the
 * site header, footer and the visitor's language (status 404, noindex).
 */
export default function MissingPage() {
  notFound();
}
