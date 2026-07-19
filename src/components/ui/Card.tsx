// import Image from "next/image";
// import Link from "next/link";

// import { cn } from "@/lib/cn";

// import Badge, { type BadgeVariant } from "./Badge";

// export interface CardProps {
//   image: string;
//   imageAlt: string;
//   title: string;
//   badge?: { text: string; variant: BadgeVariant };
//   href?: string;
//   className?: string;
// }

// export default function Card({
//   image,
//   imageAlt,
//   title,
//   badge,
//   href,
//   className,
// }: CardProps) {
//   const body = (
//     <>
//       <div>
//         <div className="relative h-[260px] w-full lg:h-[300px]">
//           {badge && (
//             <Badge
//               text={badge.text}
//               variant={badge.variant}
//               className="absolute top-3 left-1/2 z-10 -translate-x-1/2"
//             />
//           )}
//           <Image
//             src={image}
//             alt={imageAlt}
//             fill
//             sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
//             className="object-contain transition-transform duration-300 ease-in-out group-hover:scale-105"
//           />
//         </div>

//         <h3 className="mt-4 line-clamp-2 text-center text-sm leading-snug text-ink-900">
//           {title}
//         </h3>
//       </div>
//     </>
//   );

//   const className_ = cn("group block", className);

//   if (href) {
//     return (
//       <Link href={href} className={className_}>
//         {body}
//       </Link>
//     );
//   }

//   return <div className={className_}>{body}</div>;
// }
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";

import Badge, { type BadgeVariant } from "./Badge";

export interface CardProps {
  image: string;
  imageAlt: string;
  title: string;
  badge?: { text: string; variant: BadgeVariant };
  href?: string;
  className?: string;
}

export default function Card({
  image,
  imageAlt,
  title,
  badge,
  href,
  className,
}: CardProps) {
  return (
    <div className={cn("group block", className)}>
      <div className="relative h-65 w-full overflow-hidden lg:h-75">
        {badge && (
          <Badge
            text={badge.text}
            variant={badge.variant}
            className="absolute top-3 left-1/2 z-10 -translate-x-1/2"
          />
        )}
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(min-width: 1200px) 25vw, (min-width: 768px) 33vw, 50vw"
          className={cn(
            "object-contain will-change-transform",
            "transition-transform duration-600 ease-out",
            "motion-reduce:transition-none",
            "[@media(hover:hover)]:group-hover:scale-[1.04]",
          )}
        />
      </div>
      <h3 className="mt-4 line-clamp-2 text-center text-sm leading-snug text-ink-900">
        {href ? (
          <Link
            href={href}
            className="transition-colors hover:text-red-600 focus-visible:text-red-600 focus-visible:outline-none"
          >
            {title}
          </Link>
        ) : (
          title
        )}
      </h3>
    </div>
  );
}
