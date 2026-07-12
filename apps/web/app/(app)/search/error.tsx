"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function SearchError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-flow">
      <Card className="analysis-card">
        <p className="eyebrow">SEARCH ERROR</p>
        <h3 className="analysis-card__title">We could not load search right now.</h3>
        <p className="analysis-card__body">The catalog is still available, and retrying usually clears the issue.</p>
        <Button onClick={reset} variant="secondary">
          Retry
        </Button>
      </Card>
    </main>
  );
}
