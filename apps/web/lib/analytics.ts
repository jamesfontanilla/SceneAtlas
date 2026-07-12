const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

function analyticsUrl(path: string) {
  if (!apiBase) {
    return "";
  }

  return `${apiBase}${path}`;
}

async function postJson(path: string, body: Record<string, unknown>) {
  const url = analyticsUrl(path);
  if (!url) {
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify(body),
      cache: "no-store"
    });
  } catch {
    // Analytics must never block the product.
  }
}

export function postAnalyticsEvent(eventName: string, payload: Record<string, unknown> = {}) {
  return postJson("/analytics/events", {
    eventName,
    payload
  });
}

export function postAnalyticsImpression(payload: Record<string, unknown> = {}) {
  return postJson("/analytics/impression", {
    payload
  });
}
