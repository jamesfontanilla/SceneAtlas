import { fetchMovies, fetchSearchSuggestions, fetchTrendingQueries, fetchUsage } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SectionHeading } from "@/components/ui/section-heading";
import { SearchToolbar } from "@/features/search/search-toolbar";
import { SearchResults } from "@/features/search/search-results";
import { SearchSuggestions } from "@/features/search/search-suggestions";
import { TrendingStrip } from "@/features/search/trending-strip";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; genre?: string; year?: string; language?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const genre = params.genre?.trim() ?? "";
  const year = params.year?.trim() ?? "";
  const language = params.language?.trim() ?? "";

  const [movies, usage, trending, suggestions] = await Promise.all([
    fetchMovies(query, {
      genre: genre || undefined,
      year: year ? Number(year) : undefined,
      language: language || undefined
    }),
    fetchUsage(),
    fetchTrendingQueries(),
    fetchSearchSuggestions(query)
  ]);

  return (
    <main className="app-flow">
      <div className="hero" style={{ paddingTop: 0 }}>
        <SectionHeading
          eyebrow="Search"
          title="Find a movie, then open the research desk"
          copy="The search experience is designed to feel calm and high-value even when the catalog is still growing."
          action={<Button href="/movies/interstellar">Open a sample movie</Button>}
        />
        <SearchToolbar genre={genre} language={language} query={query} year={year} />
        <TrendingStrip items={trending} />
        <SearchSuggestions query={query} suggestions={suggestions} />
      </div>

      <SearchResults adsEnabled={usage.adsEnabled} movies={movies} query={query || "the catalog"} />

      <section className="section">
        <SectionHeading
          eyebrow="Usage"
          title="Free tier controls live outside the UI"
          copy="Quotas, sponsor placements, and premium unlocks are enforced in the backend, not just hidden behind front-end state."
        />
        <div className="auth-grid">
          <Card className="analysis-card">
            <Badge className="chip--accent">{usage.isPremium ? "Premium search" : "Daily search limit"}</Badge>
            <h3 className="analysis-card__title">{usage.isPremium ? "Unlimited discovery" : "Small enough to encourage upgrades"}</h3>
            <p className="analysis-card__body">
              {usage.isPremium
                ? "Premium accounts keep sponsored placements out of the way and remove the search ceiling."
                : "The free tier gets a few searches a day so casual users can try it without friction."}
            </p>
          </Card>
          <Card className="analysis-card">
            <Badge>Sponsored slots</Badge>
            <h3 className="analysis-card__title">Visible, restrained ads</h3>
            <p className="analysis-card__body">Ads sit in side rails and list breaks only, so they never hijack the research flow.</p>
          </Card>
          <Card className="analysis-card">
            <Badge>Premium unlocks</Badge>
            <h3 className="analysis-card__title">AI analysis, export, collections</h3>
            <p className="analysis-card__body">Paid users get deeper analysis, exportable notes, and no ad surfaces anywhere in the app.</p>
          </Card>
        </div>
      </section>
    </main>
  );
}
