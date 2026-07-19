import Image from "next/image";
import Link from "next/link";

import type { NewsPost } from "@/content/types";
import type { Locale } from "@/lib/i18n/config";
import { formatPostDate } from "@/lib/formatDate";

export interface BlogCardProps {
  post: NewsPost;
  href: string;
  readMoreLabel: string;
  locale: Locale;
}

export default function BlogCard({ post, href, readMoreLabel, locale }: BlogCardProps) {
  return (
    <div>
      <div className="relative aspect-4/3 w-full overflow-hidden bg-light">
        <Image
          src={post.cover}
          alt={post.title}
          fill
          sizes="(min-width: 1200px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <p className="mt-4 text-xs text-ink-500">{formatPostDate(post.date, locale)}</p>
      <h3 className="mt-2 text-xl text-brand-700">{post.title}</h3>
      <p className="mt-3 line-clamp-3 text-sm text-ink-500">{post.excerpt}</p>
      <Link
        href={href}
        className="mt-4 inline-block text-xs font-medium tracking-wide text-ink-500 uppercase underline decoration-1 underline-offset-4 transition-colors hover:text-brand-600"
      >
        {readMoreLabel}
      </Link>
    </div>
  );
}
