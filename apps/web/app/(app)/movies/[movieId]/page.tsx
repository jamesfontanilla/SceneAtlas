import { notFound } from "next/navigation";
import { addMovieToCollectionAction, exportNotesAction, toggleWatchlistAction, upsertRatingAction, upsertReviewAction } from "@/lib/actions";
import {
  fetchAccount,
  fetchAnalysis,
  fetchCollections,
  fetchLatestExport,
  fetchMovie,
  fetchRatingSummary,
  fetchReviews,
  fetchUsage,
  fetchWatchlist
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MoviePoster } from "@/components/ui/movie-poster";
import { SpoilerToggle } from "@/components/ui/spoiler-toggle";
import { AdSlot } from "@/components/ui/ad-slot";
import { SectionHeading } from "@/components/ui/section-heading";
import { formatRating, formatRuntime } from "@/lib/format";
import { InsightPanel, RelationshipMap, SimilarMoviesGrid, TimelineRail } from "@/features/movie-detail/analysis-panels";

interface MoviePageProps {
  params: Promise<{ movieId: string }>;
  searchParams: Promise<{ spoilers?: string; error?: string }>;
}

export async function generateMetadata({ params }: MoviePageProps) {
  const { movieId } = await params;
  const movie = await fetchMovie(movieId);

  if (!movie) {
    return {
      title: "Movie not found"
    };
  }

  return {
    title: `${movie.title} (${movie.year})`,
    description: movie.overview
  };
}

export default async function MoviePage({ params, searchParams }: MoviePageProps) {
  const { movieId } = await params;
  const query = await searchParams;
  const spoilers = query.spoilers === "1" || query.spoilers === "true";
  const movie = await fetchMovie(movieId);

  if (!movie) {
    notFound();
  }

  const analysis = await fetchAnalysis(movieId, spoilers);
  const [usage, account, ratingSummary, reviews, latestExport, collections, watchlist] = await Promise.all([
    fetchUsage(),
    fetchAccount(),
    fetchRatingSummary(movieId),
    fetchReviews(movieId),
    fetchLatestExport(movieId),
    fetchCollections(),
    fetchWatchlist()
  ]);

  const returnTo = `/movies/${movie.slug}${spoilers ? "?spoilers=1" : ""}`;
  const averageRating = ratingSummary.averageRating ? formatRating(ratingSummary.averageRating) : "No ratings yet";
  const isOnWatchlist = watchlist.some((item) => item.slug === movie.slug);
  const currentCollectionId = collections[0]?.id ?? "";

  return (
    <main className="detail">
      {query.error ? (
        <Card className="analysis-card">
          <Badge className="chip--accent">Action failed</Badge>
          <h3 className="analysis-card__title">We could not save that change.</h3>
          <p className="analysis-card__body">{query.error}</p>
        </Card>
      ) : null}

      <section className="detail__hero">
        <div className="detail__poster">
          <MoviePoster movie={movie} />
          <div style={{ marginTop: 16 }}>
            <SpoilerToggle enabled={spoilers} slug={movie.slug} />
          </div>
        </div>

        <div className="detail__content">
          <div>
            <p className="eyebrow">Research cut</p>
            <h1 className="detail__title">{movie.title}</h1>
            <div className="detail__meta" style={{ marginTop: 14 }}>
              <Badge className="chip--accent">{movie.year}</Badge>
              {movie.releaseDate ? <Badge>{movie.releaseDate}</Badge> : null}
              <Badge>{formatRuntime(movie.runtimeMinutes)}</Badge>
              <Badge>{formatRating(movie.rating)}</Badge>
              {movie.language ? <Badge>{movie.language}</Badge> : null}
              {movie.genres.map((genre) => (
                <Badge key={genre}>{genre}</Badge>
              ))}
            </div>
          </div>

          <Card className="analysis-card">
            <h2 className="analysis-card__title">About this title</h2>
            <p className="analysis-card__body">{movie.overview}</p>
            <div className="detail__chips" style={{ marginTop: 12 }}>
              <Badge>Directed by {movie.director}</Badge>
              <Badge>Written by {movie.writer}</Badge>
              <Badge>Score by {movie.composer}</Badge>
            </div>
          </Card>

          <div className="analysis-grid">
            <InsightPanel title="AI summary" body={spoilers ? analysis.spoilerSummary : analysis.summary} />
            <InsightPanel
              title="Ending explanation"
              body={spoilers ? analysis.spoilerEnding : "Enable spoilers to read the ending explanation."}
            />
          </div>

          <div className="analysis-grid">
            <Card className="analysis-card">
              <h3 className="analysis-card__title">Story baseline</h3>
              <p className="analysis-card__body">
                The page keeps plain metadata separate from AI analysis so the movie record still reads cleanly when spoiler content is hidden.
              </p>
            </Card>
            <Card className="analysis-card">
              <h3 className="analysis-card__title">Source baseline</h3>
              <p className="analysis-card__body">
                The production plan uses Wikidata for structured metadata and Wikimedia Commons for reusable media where licensing allows.
              </p>
            </Card>
          </div>

          {latestExport ? (
            <Card className="analysis-card">
              <h3 className="analysis-card__title">Latest export</h3>
              <p className="analysis-card__body">
                A {latestExport.format} export was generated on {latestExport.createdAt}. The export payload stays machine-friendly first.
              </p>
            </Card>
          ) : null}
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Actions" title="Save, rate, collect, or export" copy="These controls are backed by the same store the API uses, so they persist across page loads." />
        <div className="analysis-grid">
          <Card className="analysis-card">
            <h3 className="analysis-card__title">Watchlist</h3>
            <p className="analysis-card__body">
              {isOnWatchlist ? "This movie is already saved to your watchlist." : "Save the movie to your watchlist so it is easy to revisit later."}
            </p>
            <form action={toggleWatchlistAction} className="auth-form">
              <input type="hidden" name="movieId" value={movie.slug} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <Button type="submit" variant={isOnWatchlist ? "secondary" : "primary"}>
                {isOnWatchlist ? "Remove from watchlist" : "Save to watchlist"}
              </Button>
            </form>
          </Card>

          <Card className="analysis-card">
            <h3 className="analysis-card__title">Rating</h3>
            <p className="analysis-card__body">
              Community average: {averageRating}. {ratingSummary.userRating ? `Your rating: ${ratingSummary.userRating}/5.` : "Rate it to add your voice."}
            </p>
            <form action={upsertRatingAction} className="auth-form">
              <input type="hidden" name="movieId" value={movie.slug} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <label className="field">
                <span className="field__label">Your score</span>
                <select className="field__select" defaultValue={String(ratingSummary.userRating ?? 5)} name="value">
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Great</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Rough</option>
                </select>
              </label>
              <Button type="submit" variant="secondary">
                Save rating
              </Button>
            </form>
          </Card>

          <Card className="analysis-card">
            <h3 className="analysis-card__title">Collections</h3>
            <p className="analysis-card__body">
              {collections.length ? "Add this title to one of your shelves." : "Create a collection first so you can organize movies by mood or theme."}
            </p>
            {collections.length ? (
              <form action={addMovieToCollectionAction} className="auth-form">
                <input type="hidden" name="movieId" value={movie.slug} />
                <input type="hidden" name="returnTo" value={returnTo} />
                <label className="field">
                  <span className="field__label">Collection</span>
                  <select className="field__select" defaultValue={currentCollectionId} name="collectionId">
                    {collections.map((collection) => (
                      <option key={collection.id} value={collection.id}>
                        {collection.name}
                      </option>
                    ))}
                  </select>
                </label>
                <Button type="submit" variant="secondary">
                  Add to collection
                </Button>
              </form>
            ) : (
              <Button href="/collections" variant="secondary" className="button--small">
                Go to collections
              </Button>
            )}
          </Card>

          <Card className="analysis-card">
            <h3 className="analysis-card__title">Export notes</h3>
            <p className="analysis-card__body">
              Premium users can export notes in machine-friendly JSON or a presentation-friendly markdown format.
            </p>
            <form action={exportNotesAction} className="auth-form">
              <input type="hidden" name="movieId" value={movie.slug} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <label className="field">
                <span className="field__label">Format</span>
                <select className="field__select" defaultValue="json" name="format">
                  <option value="json">JSON</option>
                  <option value="markdown">Markdown</option>
                </select>
              </label>
              <Button type="submit" variant={account?.subscriptionTier === "PREMIUM" ? "primary" : "secondary"}>
                {account?.subscriptionTier === "PREMIUM" ? "Export notes" : "Upgrade to export"}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Reviews" title="Write a quick note" copy="Basic moderation hooks are present, and spoiler tagging is available on every review." />
        <div className="search-layout">
          <Card className="analysis-card">
            <h3 className="analysis-card__title">Your review</h3>
            <form action={upsertReviewAction} className="auth-form">
              <input type="hidden" name="movieId" value={movie.slug} />
              <input type="hidden" name="returnTo" value={returnTo} />
              <label className="field">
                <span className="field__label">Title</span>
                <input className="field__input" name="title" placeholder="A short headline" />
              </label>
              <label className="field">
                <span className="field__label">Body</span>
                <textarea className="field__input field__textarea" name="body" rows={5} placeholder="Write your thoughts here." />
              </label>
              <label className="field field--inline">
                <input name="spoilerTag" type="checkbox" value="true" />
                <span className="field__label">Mark as spoiler-heavy</span>
              </label>
              <Button type="submit">Save review</Button>
            </form>
          </Card>

          <div className="panel review-list">
            {reviews.length ? (
              reviews.map((review) => (
                <article className="analysis-card review-card" key={review.id}>
                  <div className="detail__chips">
                    <Badge className="chip--accent">{review.rating}/5</Badge>
                    {review.spoilerTag ? <Badge>Spoiler</Badge> : null}
                  </div>
                  <h3 className="analysis-card__title">{review.title}</h3>
                  <p className="analysis-card__body">{review.body}</p>
                  <p className="muted" style={{ marginTop: 8 }}>
                    By {review.author} on {review.createdAt}
                  </p>
                </article>
              ))
            ) : (
              <div className="panel__inner">
                <p className="muted" style={{ margin: 0 }}>
                  No reviews yet for this title.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <SectionHeading eyebrow="Timeline" title="Story beats in order" copy="The timeline section keeps the narrative readable even when the analysis gets deeper." />
        <TimelineRail analysis={analysis} />
      </section>

      <section className="section">
        <SectionHeading eyebrow="Relationships" title="Character map" copy="The graph is meant to be scannable, visually elegant, and usable inside a story research workflow." />
        <RelationshipMap analysis={analysis} />
      </section>

      <section className="section">
        <SectionHeading eyebrow="Similar titles" title="Recommended next watches" copy="Recommendations are grounded in source metadata and AI ranking, so they feel thoughtful rather than random." />
        <SimilarMoviesGrid items={analysis.similar} />
      </section>

      <section className="section">
        <SectionHeading
          eyebrow="Notes"
          title="Save, export, or keep browsing"
          copy="The free tier can save a watchlist; the premium tier unlocks exports and unlimited collections."
          action={<Button href="/billing">Unlock premium</Button>}
        />
        <div className="search-layout">
          <Card className="analysis-card">
            <h3 className="analysis-card__title">Personal notes</h3>
            <p className="analysis-card__body">
              Add your own research notes, tag the movie, and export them when you are ready to build a bigger collection of insights.
            </p>
          </Card>
          {usage.adsEnabled ? (
            <AdSlot
              title="Curated sponsor slot"
              copy="A free-user ad appears here as a small side rail card. It stays visible, clear, and out of the analysis flow."
              cta="Learn more"
              href="/billing"
            />
          ) : (
            <Card className="analysis-card">
              <h3 className="analysis-card__title">Ad-free workspace</h3>
              <p className="analysis-card__body">Premium users do not see sponsor inventory anywhere in the product.</p>
            </Card>
          )}
        </div>
      </section>
    </main>
  );
}
