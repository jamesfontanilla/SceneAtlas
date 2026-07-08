import { fetchAccount, fetchCollections, fetchWatchlist } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MovieCard } from "@/components/ui/movie-card";
import { SectionHeading } from "@/components/ui/section-heading";

export default async function WatchlistPage() {
  const [account, watchlist, collections] = await Promise.all([fetchAccount(), fetchWatchlist(), fetchCollections()]);
  const savedCount = account?.watchlistCount ?? watchlist.length;
  const collectionCount = account?.collectionCount ?? collections.length;

  return (
    <main className="app-flow">
      {!account ? (
        <Card className="analysis-card">
          <Badge className="chip--accent">Guest mode</Badge>
          <h3 className="analysis-card__title">Sign in to make this watchlist personal.</h3>
          <p className="analysis-card__body">
            The titles below are sample research cuts. Sign in to keep your own saved movies across sessions.
          </p>
          <Button href="/sign-in" variant="secondary">
            Sign in
          </Button>
        </Card>
      ) : null}

      <SectionHeading
        eyebrow="Watchlist"
        title="Keep the titles that deserve a second look"
        copy="The watchlist experience should feel personal, not like a generic bookmark dump."
        action={<Button href="/search">Find more movies</Button>}
      />

      <div className="metric-grid">
        <div className="metric-card">
          <p className="metric-card__label">Saved titles</p>
          <p className="metric-card__value">{savedCount}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Next up</p>
          <p className="metric-card__value">{Math.max(savedCount - 1, 0)}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Collections</p>
          <p className="metric-card__value">{collectionCount}</p>
        </div>
        <div className="metric-card">
          <p className="metric-card__label">Premium upgrade</p>
          <p className="metric-card__value">{account?.usage.isPremium ? "Active" : "Ready"}</p>
        </div>
      </div>

      <div className="movie-grid">
        {watchlist.length ? (
          watchlist.map((movie) => <MovieCard key={movie.slug} movie={movie} />)
        ) : (
          <Card className="analysis-card">
            <Badge className="chip--accent">Empty watchlist</Badge>
            <h3 className="analysis-card__title">Save a few titles to make this space personal.</h3>
            <p className="analysis-card__body">
              Search for a movie, open its detail page, and use the watchlist control to keep it here for later.
            </p>
            <Button href="/search" variant="secondary">
              Search movies
            </Button>
          </Card>
        )}
      </div>

      <Card className="analysis-card">
        <Badge className="chip--accent">{account?.usage.isPremium ? "Premium" : "Free"}</Badge>
        <h3 className="analysis-card__title">Organize by mood, theme, or rewatch intent</h3>
        <p className="analysis-card__body">
          Free users can use a smaller number of collections. Premium users get unlimited organization without friction.
        </p>
        <div className="detail__chips" style={{ marginTop: 12 }}>
          <Badge>{savedCount} saved</Badge>
          <Badge>{collectionCount} collections</Badge>
          {account ? <Badge>{account.reviewCount} reviews</Badge> : null}
        </div>
      </Card>
    </main>
  );
}
