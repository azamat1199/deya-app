import { Button } from "@/components/ui";
import { careersContent } from "@/content/careers";

export default function CareersJoinCta() {
  const { heading, paragraph, paragraphHighlight, buttonLabel } = careersContent.joinCta;

  return (
    <div className="flex flex-col items-center py-16 text-center lg:py-24">
      <h2 className="text-2xl font-normal text-ink-900 lg:text-3xl">{heading}</h2>

      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-ink-700 lg:text-base">
        {paragraph} <span className="font-semibold text-ink-900">{paragraphHighlight}</span>
      </p>

      <Button variant="primary" size="lg" href="#" className="mt-8">
        {buttonLabel}
      </Button>
    </div>
  );
}
