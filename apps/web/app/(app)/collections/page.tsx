import { createCollectionAction } from "@/lib/actions";
import { fetchAccount, fetchCollections } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";

interface CollectionsPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function CollectionsPage({ searchParams }: CollectionsPageProps) {
  const params = await searchParams;
  const [account, collections] = await Promise.all([fetchAccount(), fetchCollections()]);
  const collectionCount = account?.collectionCount ?? collections.length;

  return (
    <main className="app-flow">
      {params.error ? (
        <Card className="analysis-card">
          <Badge className="chip--accent">Action failed</Badge>
          <h3 className="analysis-card__title">We could not update your collections.</h3>
          <p className="analysis-card__body">{params.error}</p>
        </Card>
      ) : null}

      <SectionHeading
        eyebrow="Collections"
        title="Build research shelves for different moods"
        copy="Collections are meant to feel like polished playlists for your movie brain."
        action={<Button href="/billing">{account?.usage.isPremium ? "Premium active" : "Upgrade for unlimited"}</Button>}
      />

      {account ? (
        <Card className="analysis-card">
          <Badge className="chip--accent">Create collection</Badge>
          <form className="auth-form" action={createCollectionAction} style={{ marginTop: 16 }}>
            <label className="field">
              <span className="field__label">Name</span>
              <input className="field__input" name="name" placeholder="Watch Later" />
            </label>
            <label className="field">
              <span className="field__label">Description</span>
              <input className="field__input" name="description" placeholder="Stories with big ideas and heavy atmosphere." />
            </label>
            <label className="field">
              <span className="field__label">Visibility</span>
              <select className="field__select" defaultValue="private" name="visibility">
                <option value="private">Private</option>
                <option value="shared">Shared</option>
              </select>
            </label>
            <Button type="submit">Create collection</Button>
          </form>
        </Card>
      ) : (
        <Card className="analysis-card">
          <Badge className="chip--accent">Guest mode</Badge>
          <h3 className="analysis-card__title">Sign in to create your own shelves.</h3>
          <p className="analysis-card__body">
            You can still browse the sample collections below, but creating and saving new ones needs a signed-in account.
          </p>
          <Button href="/sign-in" variant="secondary">
            Sign in
          </Button>
        </Card>
      )}

      <div className="auth-grid">
        {collections.map((collection) => (
          <Card className="analysis-card" key={collection.id}>
            <Badge className="chip--accent">{collection.visibility}</Badge>
            <h3 className="analysis-card__title">{collection.name}</h3>
            <p className="analysis-card__body">{collection.description}</p>
            <p className="muted">{collection.movieCount} titles</p>
          </Card>
        ))}
      </div>

      <Card className="analysis-card">
        <Badge>{collectionCount} total</Badge>
        <h3 className="analysis-card__title">Unlimited collections are part of the premium tier.</h3>
        <p className="analysis-card__body">
          Free users can keep the flow small. Premium users can build as many shelves as they need without friction.
        </p>
      </Card>
    </main>
  );
}
