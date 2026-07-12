"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function MovieError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-flow">
      <Card className="analysis-card">
        <p className="eyebrow">MOVIE ERROR</p>
        <h3 className="analysis-card__title">The movie page failed to load.</h3>
        <p className="analysis-card__body">This is usually temporary. Try reloading the page or opening another title.</p>
        <Button onClick={reset} variant="secondary">
          Retry
        </Button>
      </Card>
    </main>
  );
}
