import Image from "next/image";

import { aboutContent } from "@/content/about";
import { cn } from "@/lib/cn";

export default function HistoryHero() {
  const { heading, description, timeline, image } = aboutContent.history;

  return (
    <div className="relative h-175 w-full overflow-hidden bg-ink-900 md:h-150 lg:h-175 xl:h-197.5">
      <Image
        src={image}
        alt={heading}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-ink-900/55" />

      {/* Mobile: heading/description on the left, vertical timeline along the right edge */}
      <div className="container-page relative z-10 flex h-full items-center gap-3 md:hidden">
        <div className="max-w-[65%] space-y-4">
          <h1 className="text-3xl font-light text-white">{heading}</h1>
          <p className="text-sm leading-relaxed whitespace-pre-line text-white/85">
            {description}
          </p>
        </div>

        <div className="relative ml-auto h-full w-16 shrink-0">
          <div className="absolute inset-x-0 inset-y-16">
            <div className="absolute inset-y-0 right-0.75 w-px bg-white/30" />
            {timeline.map((year, index) => {
              const isFirst = index === 0;
              const isLast = index === timeline.length - 1;
              const isEdge = isFirst || isLast;
              const topPercent = (index / (timeline.length - 1)) * 100;
              return (
                <div
                  key={year}
                  className="absolute right-0 flex items-center gap-2"
                  style={{
                    top: `${topPercent}%`,
                    transform: isFirst
                      ? "translateY(0)"
                      : isLast
                        ? "translateY(-100%)"
                        : "translateY(-50%)",
                  }}
                >
                  <span
                    className={cn(
                      "font-light whitespace-nowrap text-white",
                      isEdge ? "text-2xl" : "text-[11px] text-white/70",
                    )}
                  >
                    {year}
                  </span>
                  <span className="block h-1.5 w-1.5 shrink-0 rounded-full bg-white" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tablet/desktop: horizontal timeline above heading+description */}
      <div className="container-page relative z-10 hidden h-full flex-col justify-end pb-12 md:flex lg:pb-16">
        <div className="relative mb-16 h-20 lg:mb-20 lg:h-24">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/30" />
          {timeline.map((year, index) => {
            const isFirst = index === 0;
            const isLast = index === timeline.length - 1;
            const isEdge = isFirst || isLast;
            return (
              <div
                key={year}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${(index / (timeline.length - 1)) * 100}%` }}
              >
                <span
                  className={cn(
                    "absolute bottom-4 font-light whitespace-nowrap text-white",
                    isEdge
                      ? "text-3xl lg:text-5xl"
                      : "text-xs text-white/70 lg:text-base",
                    isFirst && "left-0",
                    isLast && "right-0",
                    !isFirst && !isLast && "left-1/2 -translate-x-1/2",
                  )}
                >
                  {year}
                </span>
                <span className="block h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-end">
          <h1 className="text-5xl font-light text-white lg:text-7xl">
            {heading}
          </h1>
          <p className="max-w-md text-sm leading-relaxed whitespace-pre-line text-white/85 lg:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
