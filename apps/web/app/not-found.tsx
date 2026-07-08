import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="auth-viewport sceneatlas-container">
      <Card className="auth-card">
        <p className="eyebrow">Not found</p>
        <h1 className="display-title section-title" style={{ marginTop: 14 }}>
          This film is not in the current research cut.
        </h1>
        <p className="auth-copy">Try one of the featured titles or open the search page to continue browsing SceneAtlas.</p>
        <div className="auth-form__actions">
          <Button href="/search">Search titles</Button>
          <Button href="/" variant="secondary">
            Back home
          </Button>
        </div>
      </Card>
    </main>
  );
}
