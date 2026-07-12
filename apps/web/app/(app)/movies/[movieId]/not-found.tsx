import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function MovieNotFound() {
  return (
    <main className="app-flow">
      <Card className="analysis-card">
        <p className="eyebrow">NOT FOUND</p>
        <h3 className="analysis-card__title">This movie could not be found.</h3>
        <p className="analysis-card__body">The title may have moved, or the catalog record may still be syncing.</p>
        <Button href="/search" variant="secondary">
          Back to search
        </Button>
      </Card>
    </main>
  );
}
