import { Button } from "./button";
import { EventPixel } from "@/components/analytics/event-pixel";

interface AdSlotProps {
  title: string;
  copy: string;
  cta: string;
  href: string;
  eyebrow?: string;
}

export function AdSlot({ title, copy, cta, href, eyebrow = "Sponsored" }: AdSlotProps) {
  return (
    <aside className="ad-slot">
      <EventPixel eventName="ad_impression" impression payload={{ title, eyebrow, href }} />
      <span className="ad-slot__label">{eyebrow}</span>
      <h3 className="ad-slot__title">{title}</h3>
      <p className="ad-slot__body">{copy}</p>
      <div className="ad-slot__actions">
        <Button href={href} variant="secondary" className="button--small">
          {cta}
        </Button>
      </div>
    </aside>
  );
}
