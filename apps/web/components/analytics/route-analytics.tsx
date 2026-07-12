"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { postAnalyticsEvent } from "@/lib/analytics";

export function RouteAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";

  useEffect(() => {
    void postAnalyticsEvent("page_view", {
      path: pathname,
      search: search || undefined
    });
  }, [pathname, search]);

  return null;
}
