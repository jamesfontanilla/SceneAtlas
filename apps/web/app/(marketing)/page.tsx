import { sceneAtlasCollections, sceneAtlasMovies, sceneAtlasReviews, sceneAtlasUsage } from "@sceneatlas/shared";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MovieCard } from "@/components/ui/movie-card";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { AdSlot } from "@/components/ui/ad-slot";
import { formatRating, formatRuntime } from "@/lib/format";

export default function MarketingPage() {
  const featured = sceneAtlasMovies.slice(0, 4);

  return (
    <main className="sceneatlas-page">
      <section className="hero">
        <div className="sceneatlas-container sceneatlas-container--wide hero__grid">
          <div className="hero__copy">
            <Badge className="chip--accent">Public SaaS ready</Badge>
            <h1 className="display-title hero-title">SceneAtlas</h1>
            <p className="hero__lede">
              Search films, unpack the story with AI, and keep the whole experience feeling editorial, premium, and fast.
              Built for public deployment on Vercel, Render, and Neon.
            </p>
            <div className="hero__actions">
              <Button href="/search">Explore the catalog</Button>
              <Button href="/billing" variant="secondary">
                View plans
              </Button>
            </div>

            <div className="metric-grid">
              <div className="metric-card">
                <p className="metric-card__label">Free searches</p>
                <p className="metric-card__value">{sceneAtlasUsage.searchesRemaining}</p>
              </div>
              <div className="metric-card">
                <p className="metric-card__label">AI analyses</p>
                <p className="metric-card__value">{sceneAtlasUsage.analysesRemaining}</p>
              </div>
              <div className="metric-card">
                <p className="metric-card__label">Ad policy</p>
                <p className="metric-card__value">Native only</p>
              </div>
              <div className="metric-card">
                <p className="metric-card__label">Baseline data</p>
                <p className="metric-card__value">Wikidata</p>
              </div>
            </div>
          </div>

          <div className="hero__aside">
            <Card className="panel--strong">
              <div className="panel__inner">
                <p className="eyebrow">Experience</p>
                <h2 className="section__title">Expensive-looking by design</h2>
                <p className="section-copy">
                  Dark editorial surfaces, calibrated amber accents, structured insights, and deliberate ad placement keep the product feeling like a luxury research tool.
                </p>
                <div className="stat-grid" style={{ marginTop: 18 }}>
                  {featured.slice(0, 2).map((movie) => (
                    <div className="stat-card" key={movie.slug}>
                      <p className="stat-card__label">{movie.title}</p>
                      <p className="stat-card__value">
                        {formatRating(movie.rating)} / {formatRuntime(movie.runtimeMinutes)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            <AdSlot
              title="Upgrade for ad-free analysis"
              copy="Premium users get exportable notes, unlimited collections, and no sponsored placements anywhere in the app."
              cta="See premium"
              href="/billing"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sceneatlas-container sceneatlas-container--wide">
          <SectionHeading
            eyebrow="What it does"
            title="Search, understand, and organize movies in one place"
            copy="SceneAtlas combines public movie metadata, AI explanations, and personal curation without turning the interface into a busy dashboard."
          />
          <div className="analysis-grid">
            <Card className="analysis-card">
              <h3 className="analysis-card__title">Structured AI insights</h3>
              <p className="analysis-card__body">
                Summaries, ending explanations, timelines, and character relationships are rendered as modular cards instead of one long wall of text.
              </p>
            </Card>
            <Card className="analysis-card">
              <h3 className="analysis-card__title">Spoiler-aware UX</h3>
              <p className="analysis-card__body">
                A first-class spoiler toggle controls which details appear so users can research a title without accidentally seeing the ending.
              </p>
            </Card>
            <Card className="analysis-card">
              <h3 className="analysis-card__title">Monetization without wrecking UX</h3>
              <p className="analysis-card__body">
                Free users get restrained sponsor cards in side rails and list breaks. Premium users get a clean, ad-free workspace.
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sceneatlas-container sceneatlas-container--wide">
          <SectionHeading
            eyebrow="Featured research cuts"
            title="Curated titles with rich editorial presentation"
            copy="The preview catalog demonstrates the interface direction, data hierarchy, and analysis structure."
          />
          <div className="movie-grid">
            {featured.map((movie) => (
              <MovieCard movie={movie} key={movie.slug} />
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sceneatlas-container sceneatlas-container--wide">
          <SectionHeading
            eyebrow="Social proof"
            title="Looks and feels like a premium product"
            copy="The goal is to keep the UI calm, legible, and quietly high-end even when the backend is still evolving."
          />
          <div className="auth-grid">
            {sceneAtlasReviews.map((review) => (
              <Card key={review.id} className="analysis-card">
                <p className="analysis-card__title">
                  {review.title} <Badge>{review.rating}/5</Badge>
                </p>
                <p className="analysis-card__body">{review.body}</p>
                <p className="muted" style={{ marginBottom: 0 }}>
                  {review.author} - {review.createdAt}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sceneatlas-container sceneatlas-container--wide">
          <SectionHeading
            eyebrow="Product design"
            title="Everything is arranged to feel deliberate"
            copy="The layout avoids clutter: research content gets the center, sponsor content stays small and explicit, and premium actions are always easy to find."
          />
          <div className="pricing-grid">
            <Card className="pricing-card">
              <p className="pricing-card__title">Free</p>
              <p className="pricing-card__price">$0</p>
              <ul className="pricing-card__list">
                <li>Limited daily searches</li>
                <li>Limited AI analyses</li>
                <li>Native ads in side rails only</li>
                <li>Watchlist and basic collections</li>
              </ul>
            </Card>
            <Card className="pricing-card pricing-card--featured">
              <p className="pricing-card__title">Premium</p>
              <p className="pricing-card__price">$9</p>
              <ul className="pricing-card__list">
                <li>Unlimited or high-cap analyses</li>
                <li>Export notes and research snippets</li>
                <li>Unlimited collections</li>
                <li>Ad-free experience</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="sceneatlas-container sceneatlas-container--wide">
          <SectionHeading
            eyebrow="Collections"
            title="Personal curation for power users"
            copy="Users can keep collections private or shared, and premium accounts are not boxed in by arbitrary limits."
          />
          <div className="metric-grid">
            {sceneAtlasCollections.map((collection) => (
              <div className="metric-card" key={collection.id}>
                <p className="metric-card__label">{collection.name}</p>
                <p className="metric-card__value">{collection.movieCount} films</p>
                <p className="muted">{collection.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
