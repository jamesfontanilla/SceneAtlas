"use client";

import { useEffect } from "react";
import { postAnalyticsEvent, postAnalyticsImpression } from "@/lib/analytics";

interface EventPixelProps {
  eventName: string;
  payload?: Record<string, unknown>;
  impression?: boolean;
}

export function EventPixel({ eventName, payload = {}, impression = false }: EventPixelProps) {
  useEffect(() => {
    if (impression) {
      void postAnalyticsImpression(payload);
      return;
    }

    void postAnalyticsEvent(eventName, payload);
  }, [eventName, impression, payload]);

  return null;
}
